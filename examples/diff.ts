import {
    registry,
    loadSchemaSnapshot,
    diffSchemas,
    saveSchemaSnapshot,
} from "../src/index.js";

import {
    resolve,
} from "node:path";

import "./user.js";

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

console.dir(
    changes,
    {
        depth: null,
    },
);