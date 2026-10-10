import "./metadata/runtime.js";
export { Table } from "./decorators/table.js";
export { Column } from "./decorators/column.js";
export {
    PrimaryKey,
} from "./decorators/primary-key.js";
export {
    Index,
} from "./decorators/index.js";
export {
    ForeignKey,
} from "./decorators/foreign-key.js";

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
    MigrationOperation,
    CreateTableOperation,
    DropTableOperation,
    AddColumnOperation,
    DropColumnOperation,
    AlterColumnOperation,
    CreateIndexOperation,
    DropIndexOperation,
    RenameTableOperation,
    RenameColumnOperation,
} from "./migration/operations.js";


export { changesToOperations } from "./migration/from-diff.js";



export type {
    Schema,
    TableSchema,
    ColumnSchema,
    ColumnType,
    IndexSchema,
    PrimaryKeySchema,
} from "./schema/types.js";

export {
    generateMigrationFile,
} from "./migration/generator.js";

export {
    findHeadRevision,
    findHeadRevisions,
    listRevisionNodes,
    listSourceRevisions,
} from "./migration/revisions.js";

export {
    downgradeToRevision,
    getCurrentRevision,
    stampRevision,
    upgradeToRevision,
} from "./migration/runner.js";

export {
    createMigrationName,
} from "./migration/naming.js";

export type {
    Database,
} from "./database/types.js";

export {
    createPostgresDatabase,
} from "./database/postgres.js";

export type {
    PostgresDatabase,
    PostgresDatabaseOptions,
} from "./database/postgres.js";

export type {
    ForeignKeyAction,
    ForeignKeyOptions,
} from "./decorators/foreign-key.js";