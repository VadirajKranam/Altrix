import {
    registry,
    saveSchemaSnapshot,
} from "../src/index.js";

import {
    resolve,
} from "node:path";

import "./user.js";

const schema = registry.getSchema();

const snapshotPath = resolve(
    ".altrix/schema.json",
);

await saveSchemaSnapshot(
    snapshotPath,
    schema,
);

console.log(
    `Schema snapshot saved to ${snapshotPath}`,
);