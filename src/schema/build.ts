import {
    registry,
} from "../metadata/registry.js";

import type {
    Schema,
} from "./types.js";

export function buildSchema(): Schema {
    return registry.getSchema();
}