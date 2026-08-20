import {
    mkdir,
    writeFile,
} from "node:fs/promises";

import {
    resolve,
} from "node:path";

import type {
    MigrationOperation,
} from "./operations.js";

import {
    createMigrationName,
} from "./naming.js";

export async function generateMigrationFile(
    name: string,
    operations: MigrationOperation[],
): Promise<string> {
    const migrationName =
        createMigrationName(name);

    const migrationsDirectory =
        resolve("migrations");

    await mkdir(
        migrationsDirectory,
        {
            recursive: true,
        },
    );

    const filePath =
        resolve(
            migrationsDirectory,
            `${migrationName}.ts`,
        );

    const contents =
        generateMigrationSource(
            migrationName,
            operations,
        );

    await writeFile(
        filePath,
        contents,
        "utf8",
    );

    return filePath;
}

function generateMigrationSource(
    migrationName: string,
    operations: MigrationOperation[],
): string {
    return `import type { Database } from "../src/database.js";

export const name = ${JSON.stringify(
        migrationName,
    )};

export async function up(
    db: Database,
): Promise<void> {
    // TODO: generate SQL
}

export async function down(
    db: Database,
): Promise<void> {
    // TODO: generate rollback SQL
}
`;
}