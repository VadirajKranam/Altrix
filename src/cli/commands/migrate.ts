import {
    readFile,
} from "node:fs/promises";

import {
    resolve,
} from "node:path";

import {
    diffSchemas,
} from "../../diff/diff.js";

import {
    saveSchemaSnapshot,
} from "../../index.js";

import {
    changesToOperations,
} from "../../migration/from-diff.js";

import {
    generateMigrationFile,
} from "../../migration/generator.js";

import type {
    Schema,
} from "../../schema/types.js";

import {
    buildSchema,
} from "../../schema/build.js";

import {
    loadModels,
} from "../../schema/load-models.js";

export async function createMigration(
    name: string,
): Promise<void> {
  

    await loadModels();

    const currentSchema =
        await buildSchema();


    const snapshotPath = ".altrix/schema.json";
    await saveSchemaSnapshot(
        snapshotPath,
        currentSchema,
    );

    const snapshotContent =
        await readFile(
            snapshotPath,
            "utf8",
        );

    const previousSchema =
        JSON.parse(
            snapshotContent,
        ) as Schema;

    const changes =
        diffSchemas(
            previousSchema,
            currentSchema,
        );

    if (changes.length === 0) {
        console.log(
            "No schema changes detected.",
        );

        return;
    }

    const operations =
        changesToOperations(
            changes,
        );

        if (operations.length === 0) {
    console.log(
        "No migration operations generated.",
    );

    return;
}

    const filePath =
        await generateMigrationFile(
            name,
            operations,
        );

        await saveSchemaSnapshot(
            snapshotPath,
            currentSchema,
        );
        console.log(
        `Migration created: ${filePath}`,
    );
}