export interface Schema {
    tables: TableSchema[];
}

export interface TableSchema {
    name: string;
    columns: ColumnSchema[];
    indexes: IndexSchema[];
    primaryKey?: PrimaryKeySchema;
}

export interface ColumnSchema {
    name: string;
    type: ColumnType;
    length?: number;
    nullable: boolean;
    default?: unknown;
}

export type ColumnType =
    | "uuid"
    | "varchar"
    | "text"
    | "integer"
    | "bigint"
    | "boolean"
    | "datetime"
    | "date"
    | "decimal";

export interface PrimaryKeySchema {
    columns: string[];
}

export interface IndexSchema {
    name: string;
    columns: string[];
    unique: boolean;
}