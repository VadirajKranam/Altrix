import type {
    SchemaChange,
} from "../diff/diff.js";

import type {
    MigrationOperation,
} from "./operations.js";

export function changesToOperations(
    changes: SchemaChange[],
): MigrationOperation[] {
    const operations: MigrationOperation[] = [];

    for (const change of changes) {
        switch (change.type) {
            case "ADD_TABLE":
                operations.push({
                    type: "CREATE_TABLE",
                    table: change.table,
                });
                break;

            case "DROP_TABLE":
                operations.push({
                    type: "DROP_TABLE",
                    table: change.table,
                });
                break;

            case "ADD_COLUMN":
                operations.push({
                    type: "ADD_COLUMN",
                    table: change.table,
                    column: change.column,
                });
                break;

            case "DROP_COLUMN":
                operations.push({
                    type: "DROP_COLUMN",
                    table: change.table,
                    column: change.column,
                });
                break;

            case "ALTER_COLUMN":
                operations.push({
                    type: "ALTER_COLUMN",
                    table: change.table,
                    from: change.from,
                    to: change.to,
                });
                break;

            case "ADD_INDEX":
                operations.push({
                    type: "CREATE_INDEX",
                    table: change.table,
                    index: change.index,
                });
                break;

            case "DROP_INDEX":
                operations.push({
                    type: "DROP_INDEX",
                    table: change.table,
                    index: change.index,
                });
                break;

            case "ALTER_INDEX":
                operations.push({
                    type: "DROP_INDEX",
                    table: change.table,
                    index: change.from,
                });

                operations.push({
                    type: "CREATE_INDEX",
                    table: change.table,
                    index: change.to,
                });

                break;

            case "RENAME_TABLE":
                operations.push({
                    type: "RENAME_TABLE",
                    from: change.from,
                    to: change.to,
                });
                break;

            case "RENAME_COLUMN":
                operations.push({
                    type: "RENAME_COLUMN",
                    table: change.table,
                    from: change.from,
                    to: change.to,
                });
                break;
        }
    }

    return operations;
}