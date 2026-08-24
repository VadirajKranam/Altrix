import {
    registry,
    loadSchemaSnapshot,
    diffSchemas,
    saveSchemaSnapshot,
    changesToOperations
} from "../src/index.js";


import {
    resolve,
} from "node:path";

import "./user.js";

import {
    generateMigrationFile,
} from "../src/index.js";

import {
    generateUpSql,
    generateDownSql,
} from "../src/sql/mysql/generator.js";

const snapshotPath = resolve(
    ".altrix/schema.json",
);

const previousSchema =
    await loadSchemaSnapshot(
        snapshotPath,
    );

if (!previousSchema) {
    console.log(
        "No previous schema found.",
    );

    await saveSchemaSnapshot(
        snapshotPath,
        registry.getSchema(),
    );

    process.exit(0);
}

const currentSchema =
    registry.getSchema();

const changes =
    diffSchemas(
        previousSchema,
        currentSchema,
    );

const operations =
    changesToOperations(
        changes,
    );

    if (operations.length > 0) {
    const filePath =
        await generateMigrationFile(
            "schema_changes",
            operations,
        );

    console.log(
        `Migration created: ${filePath}`,
    );
}

console.log("Changes:");

console.dir(
    changes,
    {
        depth: null,
    },
);

console.log("Operations:");

console.dir(
    operations,
    {
        depth: null,
    },
);

const upSql =
    generateUpSql(
        operations,
    );

const downSql =
    generateDownSql(
        operations,
    );

console.log("UP:");

console.dir(upSql);

console.log("DOWN:");

console.dir(downSql);