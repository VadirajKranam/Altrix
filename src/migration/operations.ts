import type {
    ColumnSchema,
    IndexSchema,
    TableSchema,
} from "../schema/types.js";

export type MigrationOperation =
    | CreateTableOperation
    | DropTableOperation
    | AddColumnOperation
    | DropColumnOperation
    | AlterColumnOperation
    | CreateIndexOperation
    | DropIndexOperation
    | RenameTableOperation
    | RenameColumnOperation;

export interface CreateTableOperation {
    type: "CREATE_TABLE";
    table: TableSchema;
}

export interface DropTableOperation {
    type: "DROP_TABLE";
    table: TableSchema;
}

export interface AddColumnOperation {
    type: "ADD_COLUMN";
    table: string;
    column: ColumnSchema;
}

export interface DropColumnOperation {
    type: "DROP_COLUMN";
    table: string;
    column: ColumnSchema;
}

export interface AlterColumnOperation {
    type: "ALTER_COLUMN";
    table: string;
    from: ColumnSchema;
    to: ColumnSchema;
}

export interface CreateIndexOperation {
    type: "CREATE_INDEX";
    table: string;
    index: IndexSchema;
}

export interface DropIndexOperation {
    type: "DROP_INDEX";
    table: string;
    index: IndexSchema;
}

export interface RenameTableOperation {
    type: "RENAME_TABLE";
    from: string;
    to: string;
}

export interface RenameColumnOperation {
    type: "RENAME_COLUMN";
    table: string;
    from: string;
    to: string;
}