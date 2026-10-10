import {
    mkdtemp,
    mkdir,
    writeFile,
    rm,
} from "node:fs/promises";

import {
    tmpdir,
} from "node:os";

import {
    join,
} from "node:path";

export interface TestWorkspace {
    root: string;
    cleanup(): Promise<void>;
}

export async function createTestWorkspace(
    prefix = "altrix-test-",
): Promise<TestWorkspace> {
    const root = await mkdtemp(
        join(tmpdir(), prefix),
    );

    return {
        root,
        async cleanup() {
            await rm(root, {
                recursive: true,
                force: true,
            });
        },
    };
}

export async function writeMigrationPair(
    root: string,
    revision: string,
    downRevision: string | null,
    upSql: string,
): Promise<void> {
    await mkdir(
        join(root, "migrations"),
        {
            recursive: true,
        },
    );

    await mkdir(
        join(root, "dist", "migrations"),
        {
            recursive: true,
        },
    );

    const sourcePath = join(
        root,
        "migrations",
        `${revision}.ts`,
    );

    const compiledPath = join(
        root,
        "dist",
        "migrations",
        `${revision}.js`,
    );

    const source = `export const revision = ${JSON.stringify(revision)};
export const downRevision = ${downRevision === null ? "null" : JSON.stringify(downRevision)};
`;

    const compiled = `export const revision = ${JSON.stringify(revision)};
export const downRevision = ${downRevision === null ? "null" : JSON.stringify(downRevision)};
export async function up(db){ await db.execute(${JSON.stringify(upSql)}); }
export async function down(db){ await db.execute("-- down"); }
`;

    await writeFile(sourcePath, source, "utf8");
    await writeFile(compiledPath, compiled, "utf8");
}
