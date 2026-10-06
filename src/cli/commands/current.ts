import {
    resolve,
} from "node:path";

import {
    pathToFileURL,
} from "node:url";

import type {
    Database,
} from "../../database/types.js";

import {
    getCurrentRevision,
} from "../../migration/runner.js";

export async function showCurrentRevision(
    adapterPathArg?: string,
): Promise<void> {
    const adapterPath =
        adapterPathArg ??
        process.env.ALTRIX_DB_ADAPTER;

    if (!adapterPath) {
        throw new Error(
            "Database adapter path is required. Use --adapter <path> or set ALTRIX_DB_ADAPTER.",
        );
    }

    const db =
        await loadDatabaseAdapter(
            adapterPath,
        );

    const revision =
        await getCurrentRevision(db);

    console.log(
        `Current revision: ${revision ?? "none"}`,
    );
}

async function loadDatabaseAdapter(
    adapterPath: string,
): Promise<Database> {
    const absolutePath =
        resolve(adapterPath);

    const modulePath =
        pathToFileURL(absolutePath).href;

    const module =
        await import(modulePath) as {
            database?: Database;
            createDatabase?: () => Database | Promise<Database>;
            default?: Database;
        };

    if (module.database) {
        return module.database;
    }

    if (module.default) {
        return module.default;
    }

    if (module.createDatabase) {
        return await module.createDatabase();
    }

    throw new Error(
        `Adapter module does not export a database object: ${adapterPath}`,
    );
}
