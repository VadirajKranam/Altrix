import "./metadata/runtime.js";
export { Table } from "./decorators/table.js";
export { Column } from "./decorators/column.js";
export {
    PrimaryKey,
} from "./decorators/primary-key.js";
export {
    Index,
} from "./decorators/index.js";

export { registry } from "./metadata/registry.js";

export {
    saveSchemaSnapshot,
    loadSchemaSnapshot,
} from "./schema/snapshot.js";

export {
    diffSchemas,
} from "./diff/diff.js";

    export type {
        SchemaChange,
        AddTableChange,
        DropTableChange,
        AddColumnChange,
        DropColumnChange,
        AlterColumnChange,
        AddIndexChange,
        DropIndexChange,
        AlterIndexChange,
    } from "./diff/diff.js";

export type {
    Schema,
    TableSchema,
    ColumnSchema,
    ColumnType,
    IndexSchema,
    PrimaryKeySchema,
} from "./schema/types.js";