import type {
    MigrationOperation,
} from "./operations.js";

export interface MigrationFile {
    name: string;
    timestamp: string;
    operations: MigrationOperation[];
}