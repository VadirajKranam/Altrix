import type {
    MigrationOperation,
} from "../../migration/operations.js";

import type {
    ColumnSchema,
    TableSchema,
} from "../../schema/types.js";

export function generateUpSql(
    operations: MigrationOperation[],
): string[] {
    return operations.map(
        operation =>
            generateSql(
                operation,
                "up",
            ),
    );
}

export function generateDownSql(
    operations: MigrationOperation[],
): string[] {
    return [...operations]
        .reverse()
        .map(
            operation =>
                generateSql(
                    operation,
                    "down",
                ),
        );
}

function generateSql(
    operation: MigrationOperation,
    direction: "up" | "down",
): string {
    switch (operation.type) {
        case "CREATE_TABLE":
            return direction === "up"
                ? createTableSql(operation)
                : dropTableSql(operation);

        case "DROP_TABLE":
            return direction === "up"
                ? dropTableSql(operation)
                : createTableSql(operation);

        case "ADD_COLUMN":
            return direction === "up"
                ? addColumnSql(operation)
                : dropColumnSql(operation);

        case "DROP_COLUMN":
            return direction === "up"
                ? dropColumnSql(operation)
                : addColumnSql(operation);

        case "ALTER_COLUMN":
            return direction === "up"
                ? alterColumnSql(
                    operation.table,
                    operation.to,
                )
                : alterColumnSql(
                    operation.table,
                    operation.from,
                );

        case "CREATE_INDEX":
            return direction === "up"
                ? createIndexSql(operation)
                : dropIndexSql(operation);

        case "DROP_INDEX":
            return direction === "up"
                ? dropIndexSql(operation)
                : createIndexSql(operation);

        case "RENAME_TABLE":
            return direction === "up"
                ? renameTableSql(
                    operation.from,
                    operation.to,
                )
                : renameTableSql(
                    operation.to,
                    operation.from,
                );

        case "RENAME_COLUMN":
            return direction === "up"
                ? renameColumnSql(
                    operation.table,
                    operation.from,
                    operation.to,
                )
                : renameColumnSql(
                    operation.table,
                    operation.to,
                    operation.from,
                );
    }
}


function createTableSql(
    operation: {
        table: TableSchema;
    },
): string {
    const table =
        operation.table;

    const columns =
        table.columns
            .map(columnSql)
            .join(",\n    ");

    const primaryKey =
        table.primaryKey
            ? `,\n    PRIMARY KEY (${table.primaryKey.columns.join(", ")})`
            : "";

    return `CREATE TABLE ${table.name} (
    ${columns}${primaryKey}
);`;
}

function dropTableSql(
    operation: {
        table: TableSchema;
    },
): string {
    return `DROP TABLE ${operation.table.name};`;
}

function addColumnSql(
    operation: {
        table: string;
        column: ColumnSchema;
    },
): string {
    return `ALTER TABLE ${operation.table}
ADD COLUMN ${columnSql(operation.column)};`;
}

function dropColumnSql(
    operation: {
        table: string;
        column: ColumnSchema;
    },
): string {
    return `ALTER TABLE ${operation.table}
DROP COLUMN ${operation.column.name};`;
}

function alterColumnSql(
    table: string,
    column: ColumnSchema,
): string {
    return `ALTER TABLE ${table}
MODIFY COLUMN ${columnSql(column)};`;
}

function createIndexSql(
    operation: {
        table: string;
        index: {
            name: string;
            columns: string[];
            unique?: boolean;
        };
    },
): string {
    const unique =
        operation.index.unique
            ? "UNIQUE "
            : "";

    return `CREATE ${unique}INDEX ${operation.index.name}
ON ${operation.table} (${operation.index.columns.join(", ")});`;
}

function dropIndexSql(
    operation: {
        table: string;
        index: {
            name: string;
        };
    },
): string {
    return `DROP INDEX ${operation.index.name}
ON ${operation.table};`;
}

function renameTableSql(
    from: string,
    to: string,
): string {
    return `RENAME TABLE ${from} TO ${to};`;
}

function renameColumnSql(
    table: string,
    from: string,
    to: string,
): string {
    return `ALTER TABLE ${table}
RENAME COLUMN ${from} TO ${to};`;
}

function columnSql(
    column: ColumnSchema,
): string {
    let sql =
        `${column.name} ${columnTypeSql(column)}`;

    if (!column.nullable) {
        sql += " NOT NULL";
    }

    if (
        column.default !== undefined
    ) {
        sql += ` DEFAULT ${column.default}`;
    }

    return sql;
}

function columnTypeSql(
    column: ColumnSchema,
): string {
    switch (column.type) {
        case "uuid":
            return "CHAR(36)";

        case "varchar":
            return column.length
                ? `VARCHAR(${column.length})`
                : "VARCHAR";

        case "text":
            return "TEXT";

        case "integer":
            return "INT";

        case "bigint":
            return "BIGINT";

        case "boolean":
            return "BOOLEAN";

        case "datetime":
            return "DATETIME";

        case "date":
            return "DATE";

        case "decimal":
            return "DECIMAL";

        default:
            return column.type;
    }
}