import {
    readdir,
} from "node:fs/promises";

import {
    basename,
    resolve,
} from "node:path";

export interface RevisionInfo {
    revision: string;
    fileName: string;
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
    const revisions =
        await listSourceRevisions();

    if (revisions.length === 0) {
        return null;
    }

    return revisions[
        revisions.length - 1
    ]!.revision;
}
