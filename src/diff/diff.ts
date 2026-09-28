import type {
    Schema,
    TableSchema,
    ColumnSchema,
    IndexSchema,
} from "../schema/types.js";

export type SchemaChange =
    | AddTableChange
    | DropTableChange
    | AddColumnChange
    | DropColumnChange
    | AlterColumnChange
    | AddIndexChange
    | DropIndexChange
    | AlterIndexChange
    | RenameColumnChange
    | RenameTableChange;

export interface AddTableChange {
    type: "ADD_TABLE";
    table: TableSchema;
}

export interface DropTableChange {
    type: "DROP_TABLE";
    table: TableSchema;
}

export interface AddColumnChange {
    type: "ADD_COLUMN";
    table: string;
    column: ColumnSchema;
}

export interface DropColumnChange {
    type: "DROP_COLUMN";
    table: string;
    column: ColumnSchema;
}

export interface AlterColumnChange {
    type: "ALTER_COLUMN";
    table: string;
    from: ColumnSchema;
    to: ColumnSchema;
}

export interface AddIndexChange {
    type: "ADD_INDEX";
    table: string;
    index: IndexSchema;
}

export interface DropIndexChange {
    type: "DROP_INDEX";
    table: string;
    index: IndexSchema;
}

export interface AlterIndexChange {
    type: "ALTER_INDEX";
    table: string;
    from: IndexSchema;
    to: IndexSchema;
}

export interface RenameColumnChange {
    type: "RENAME_COLUMN";
    table: string;
    from: string;
    to: string;
}

export interface RenameTableChange {
    type: "RENAME_TABLE";
    from: string;
    to: string;
}

export function diffSchemas(
    previous: Schema,
    current: Schema,
): SchemaChange[] {
    const changes: SchemaChange[] = [];

    const previousTables =
        new Map(
            previous.tables.map(
                table => [
                    table.name,
                    table,
                ],
            ),
        );

    const currentTables =
        new Map(
            current.tables.map(
                table => [
                    table.name,
                    table,
                ],
            ),
        );

    /*
     * New tables
     */
    for (const [
        tableName,
        currentTable,
    ] of currentTables) {
        if (!previousTables.has(tableName)) {
            changes.push({
                type: "ADD_TABLE",
                table: currentTable,
            });
        }
    }

    /*
     * Deleted tables
     */
    for (const [
        tableName,
        previousTable,
    ] of previousTables) {
        if (!currentTables.has(tableName)) {
            changes.push({
                type: "DROP_TABLE",
                table: previousTable,
            });
        }
    }

    /*
     * Existing tables
     */
    for (const [
        tableName,
        currentTable,
    ] of currentTables) {
        const previousTable =
            previousTables.get(tableName);

        if (!previousTable) {
            continue;
        }

        diffColumns(
            previousTable,
            currentTable,
            changes,
        );
        diffIndexes(
            previousTable,
            currentTable,
            changes,
        );
    }

    return changes;
}

function diffColumns(
    previousTable: TableSchema,
    currentTable: TableSchema,
    changes: SchemaChange[],
): void {
    const previousColumns =
        new Map(
            previousTable.columns.map(
                column => [
                    column.name,
                    column,
                ],
            ),
        );

    const currentColumns =
        new Map(
            currentTable.columns.map(
                column => [
                    column.name,
                    column,
                ],
            ),
        );

    /*
     * New columns
     */
    for (const [
        columnName,
        currentColumn,
    ] of currentColumns) {
        if (!previousColumns.has(columnName)) {
            changes.push({
                type: "ADD_COLUMN",
                table: currentTable.name,
                column: currentColumn,
            });
        }
    }

    /*
     * Deleted columns
     */
    for (const [
        columnName,
        previousColumn,
    ] of previousColumns) {
        if (!currentColumns.has(columnName)) {
            changes.push({
                type: "DROP_COLUMN",
                table: currentTable.name,
                column: previousColumn,
            });
        }
    }

    /*
     * Changed columns
     */
    for (const [
        columnName,
        currentColumn,
    ] of currentColumns) {
        const previousColumn =
            previousColumns.get(columnName);

        if (!previousColumn) {
            continue;
        }

        if (
            !columnsEqual(
                previousColumn,
                currentColumn,
            )
        ) {
            changes.push({
                type: "ALTER_COLUMN",
                table: currentTable.name,
                from: previousColumn,
                to: currentColumn,
            });
        }
    }
}

function diffIndexes(
    previousTable: TableSchema,
    currentTable: TableSchema,
    changes: SchemaChange[],
): void {
    const previousIndexes =
        new Map(
            previousTable.indexes.map(
                index => [
                    index.name,
                    index,
                ],
            ),
        );

    const currentIndexes =
        new Map(
            currentTable.indexes.map(
                index => [
                    index.name,
                    index,
                ],
            ),
        );

    /*
     * New indexes
     */
    for (const [
        indexName,
        currentIndex,
    ] of currentIndexes) {
        if (!previousIndexes.has(indexName)) {
            changes.push({
                type: "ADD_INDEX",
                table: currentTable.name,
                index: currentIndex,
            });
        }
    }

    /*
     * Deleted indexes
     */
    for (const [
        indexName,
        previousIndex,
    ] of previousIndexes) {
        if (!currentIndexes.has(indexName)) {
            changes.push({
                type: "DROP_INDEX",
                table: currentTable.name,
                index: previousIndex,
            });
        }
    }

    /*
     * Changed indexes
     */
    for (const [
        indexName,
        currentIndex,
    ] of currentIndexes) {
        const previousIndex =
            previousIndexes.get(indexName);

        if (!previousIndex) {
            continue;
        }

        if (
            !indexesEqual(
                previousIndex,
                currentIndex,
            )
        ) {
            changes.push({
                type: "ALTER_INDEX",
                table: currentTable.name,
                from: previousIndex,
                to: currentIndex,
            });
        }
    }
}

function columnsEqual(
    a: ColumnSchema,
    b: ColumnSchema,
): boolean {
    return (
        a.name === b.name &&
        a.type === b.type &&
        a.nullable === b.nullable &&
        a.length === b.length &&
        a.default === b.default &&
        foreignKeyEqual(
            a.foreignKey,
            b.foreignKey,
        )
    );
}

function foreignKeyEqual(
    a?: { table: string; column: string; onDelete?: string; onUpdate?: string },
    b?: { table: string; column: string; onDelete?: string; onUpdate?: string },
): boolean {
    if (a === undefined || b === undefined) {
        return a === b;
    }

    return (
        a.table === b.table &&
        a.column === b.column &&
        a.onDelete === b.onDelete &&
        a.onUpdate === b.onUpdate
    );
}

function indexesEqual(
    a: IndexSchema,
    b: IndexSchema,
): boolean {
    if (
        a.name !== b.name ||
        a.unique !== b.unique
    ) {
        return false;
    }

    if (
        a.columns.length !==
        b.columns.length
    ) {
        return false;
    }

    for (let i = 0; i < a.columns.length; i++) {
        if (
            a.columns[i] !==
            b.columns[i]
        ) {
            return false;
        }
    }

    return true;
}