import {
    mkdir,
    readFile,
    writeFile,
} from "node:fs/promises";

import {
    dirname,
    resolve,
} from "node:path";

import {
    pathToFileURL,
} from "node:url";

import type {
    Database,
} from "../database/types.js";

import {
    listSourceRevisions,
} from "./revisions.js";

export interface MigrationModule {
    revision: string;
    downRevision: string | null;
    up(db: Database): Promise<void>;
    down(db: Database): Promise<void>;
}

interface MigrationState {
    currentRevision: string | null;
    applied: string[];
}

export interface UpgradeResult {
    fromRevision: string | null;
    toRevision: string | null;
    appliedRevisions: string[];
}

const STATE_FILE_PATH =
    ".altrix/revisions.json";

const VERSION_TABLE_NAME =
    "altrix_version";

const VERSION_COLUMN_NAME =
    "version_num";

export async function upgradeToRevision(
    db: Database,
    target: string,
): Promise<UpgradeResult> {
    const revisions =
        await listSourceRevisions();

    if (revisions.length === 0) {
        return {
            fromRevision: null,
            toRevision: null,
            appliedRevisions: [],
        };
    }

    const state =
        await loadMigrationState();

    await ensureVersionTable(db);

    const currentRevision =
        await resolveCurrentRevision(
            db,
            state.currentRevision,
        );

    const fromRevision =
        currentRevision;

    const resolvedTarget =
        target === "head"
            ? revisions[revisions.length - 1]!.revision
            : target;

    const targetIndex =
        revisions.findIndex(
            revision =>
                revision.revision === resolvedTarget,
        );

    if (targetIndex === -1) {
        throw new Error(
            `Target revision not found: ${resolvedTarget}`,
        );
    }

    const currentIndex =
        currentRevision
            ? revisions.findIndex(
                revision =>
                    revision.revision === currentRevision,
            )
            : -1;

    if (
        currentRevision !== null &&
        currentIndex === -1
    ) {
        throw new Error(
            `Current revision not found in migrations: ${currentRevision}`,
        );
    }

    if (targetIndex <= currentIndex) {
        return {
            fromRevision,
            toRevision: resolvedTarget,
            appliedRevisions: [],
        };
    }

    const pending = revisions.slice(
        currentIndex + 1,
        targetIndex + 1,
    );

    const appliedRevisions: string[] = [];

    for (const revision of pending) {
        const migration =
            await loadCompiledMigration(
                revision.fileName,
            );

        if (migration.revision !== revision.revision) {
            throw new Error(
                `Revision mismatch in ${revision.fileName}: expected ${revision.revision}, got ${migration.revision}`,
            );
        }

        await migration.up(db);
        appliedRevisions.push(
            migration.revision,
        );
    }

    const newState: MigrationState = {
        currentRevision: resolvedTarget,
        applied: [
            ...state.applied,
            ...appliedRevisions,
        ],
    };

    await persistCurrentRevision(
        db,
        resolvedTarget,
    );

    await saveMigrationState(newState);

    return {
        fromRevision,
        toRevision: resolvedTarget,
        appliedRevisions,
    };
}

export async function getCurrentRevision(
    db: Database,
): Promise<string | null> {
    const state =
        await loadMigrationState();

    await ensureVersionTable(db);

    return resolveCurrentRevision(
        db,
        state.currentRevision,
    );
}

async function loadCompiledMigration(
    sourceFileName: string,
): Promise<MigrationModule> {
    const compiledFileName =
        sourceFileName.replace(
            /\.ts$/,
            ".js",
        );

    const compiledPath =
        resolve(
            "dist",
            "migrations",
            compiledFileName,
        );

    const modulePath =
        pathToFileURL(compiledPath).href;

    const loaded =
        await import(modulePath) as MigrationModule;

    if (typeof loaded.up !== "function") {
        throw new Error(
            `Migration missing up(): ${sourceFileName}`,
        );
    }

    if (typeof loaded.down !== "function") {
        throw new Error(
            `Migration missing down(): ${sourceFileName}`,
        );
    }

    const revision =
        loaded.revision ??
        sourceFileName.replace(
            /\.ts$/,
            "",
        );

    return {
        ...loaded,
        revision,
        downRevision:
            loaded.downRevision ?? null,
    };
}

async function loadMigrationState(): Promise<MigrationState> {
    try {
        const content =
            await readFile(
                STATE_FILE_PATH,
                "utf8",
            );

        const parsed =
            JSON.parse(content) as MigrationState;

        return {
            currentRevision:
                parsed.currentRevision ?? null,
            applied:
                Array.isArray(parsed.applied)
                    ? parsed.applied
                    : [],
        };
    } catch (error: unknown) {
        const code = (
            error as {
                code?: string;
            }
        ).code;

        if (code === "ENOENT") {
            return {
                currentRevision: null,
                applied: [],
            };
        }

        throw error;
    }
}

async function saveMigrationState(
    state: MigrationState,
): Promise<void> {
    await mkdir(
        dirname(STATE_FILE_PATH),
        {
            recursive: true,
        },
    );

    await writeFile(
        STATE_FILE_PATH,
        JSON.stringify(
            state,
            null,
            2,
        ),
        "utf8",
    );
}

async function ensureVersionTable(
    db: Database,
): Promise<void> {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS ${VERSION_TABLE_NAME} (
            ${VERSION_COLUMN_NAME} VARCHAR(255) NOT NULL PRIMARY KEY
        );
    `);
}

async function resolveCurrentRevision(
    db: Database,
    fallbackRevision: string | null,
): Promise<string | null> {
    if (!db.query) {
        return fallbackRevision;
    }

    const rows =
        await db.query<{
            version_num?: string | null;
            VERSION_NUM?: string | null;
            versionNum?: string | null;
        }>(`
        SELECT ${VERSION_COLUMN_NAME}
        FROM ${VERSION_TABLE_NAME}
        LIMIT 1;
    `);

    const firstRow =
        rows[0];

    const revision =
        firstRow?.version_num ??
        firstRow?.VERSION_NUM ??
        firstRow?.versionNum ??
        null;

    if (revision) {
        return revision;
    }

    if (!fallbackRevision) {
        return null;
    }

    await persistCurrentRevision(
        db,
        fallbackRevision,
    );

    return fallbackRevision;
}

async function persistCurrentRevision(
    db: Database,
    revision: string,
): Promise<void> {
    await db.execute(`
        DELETE FROM ${VERSION_TABLE_NAME};
    `);

    await db.execute(`
        INSERT INTO ${VERSION_TABLE_NAME} (${VERSION_COLUMN_NAME})
        VALUES ('${escapeSqlLiteral(revision)}');
    `);
}

function escapeSqlLiteral(
    value: string,
): string {
    return value.replace(/'/g, "''");
}
