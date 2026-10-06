import {
    readdir,
    readFile,
} from "node:fs/promises";

import {
    basename,
    resolve,
} from "node:path";

export interface RevisionInfo {
    revision: string;
    fileName: string;
}

export interface RevisionNode extends RevisionInfo {
    downRevision: string | null;
}

const REVISION_PATTERN =
    /^\d{14}_[a-z0-9_]+\.ts$/;

export async function listSourceRevisions(): Promise<RevisionInfo[]> {
    const migrationsDirectory =
        resolve("migrations");

    let entries: string[];

    try {
        entries = await readdir(migrationsDirectory);
    } catch {
        return [];
    }

    return entries
        .filter(fileName => REVISION_PATTERN.test(fileName))
        .sort((a, b) => a.localeCompare(b))
        .map(fileName => ({
            fileName,
            revision: basename(fileName, ".ts"),
        }));
}

export async function findHeadRevision(): Promise<string | null> {
    const heads =
        await findHeadRevisions();

    if (heads.length === 0) {
        return null;
    }

    return heads.sort((a, b) => a.localeCompare(b))[
        heads.length - 1
    ]!;
}

export async function listRevisionNodes(): Promise<RevisionNode[]> {
    const revisions =
        await listSourceRevisions();

    const nodesWithMetadata = await Promise.all(
        revisions.map(async (revision, index) => {
            const filePath =
                resolve(
                    "migrations",
                    revision.fileName,
                );

            const source =
                await readFile(
                    filePath,
                    "utf8",
                );

            const explicitRevision =
                parseExportedString(source, "revision");

            const explicitDownRevision =
                parseExportedString(source, "downRevision") ??
                parseExportedNull(source, "downRevision");

            const effectiveRevision =
                explicitRevision ?? revision.revision;

            const fallbackDownRevision =
                index > 0
                    ? revisions[index - 1]!.revision
                    : null;

            return {
                fileName: revision.fileName,
                revision: effectiveRevision,
                downRevision:
                    explicitDownRevision ?? fallbackDownRevision,
            };
        }),
    );

    return nodesWithMetadata;
}

export async function findHeadRevisions(): Promise<string[]> {
    const nodes =
        await listRevisionNodes();

    if (nodes.length === 0) {
        return [];
    }

    const referencedAsParent =
        new Set(
            nodes
                .map(node => node.downRevision)
                .filter(
                    (revision): revision is string =>
                        revision !== null,
                ),
        );

    return nodes
        .filter(
            node =>
                !referencedAsParent.has(node.revision),
        )
        .map(node => node.revision);
}

function parseExportedString(
    source: string,
    exportName: string,
): string | null {
    const match = source.match(
        new RegExp(
            `export\\s+const\\s+${exportName}\\s*=\\s*["']([^"']+)["']\\s*;`,
        ),
    );

    return match?.[1] ?? null;
}

function parseExportedNull(
    source: string,
    exportName: string,
): null | undefined {
    const match = source.match(
        new RegExp(
            `export\\s+const\\s+${exportName}\\s*=\\s*null\\s*;`,
        ),
    );

    if (match) {
        return null;
    }

    return undefined;
}
