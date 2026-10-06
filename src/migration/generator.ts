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

import {
    findHeadRevision,
} from "./revisions.js";

import type { Database } from "../database/types.js";

import {
    generateUpSql,
    generateDownSql,
} from "../sql/mysql/generator.js";

export async function generateMigrationFile(
    name: string,
    operations: MigrationOperation[],
): Promise<string> {
    const migrationName =
        createMigrationName(name);

    const downRevision =
        await findHeadRevision();

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
            downRevision,
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
    downRevision: string | null,
    operations: MigrationOperation[],
): string {
    const upSql = generateUpSql(operations);
    const downSql = generateDownSql(operations);

    const upStatements = generateStatements(upSql);
    const downStatements = generateStatements(downSql);

    return `import type {
    Database,
} from "../src/database/types.js";

export const name = ${JSON.stringify(
        migrationName,
    )};

export const revision = ${JSON.stringify(
        migrationName,
    )};

export const downRevision = ${JSON.stringify(
        downRevision,
    )};

export async function up(
    db: Database,
): Promise<void> {
${upStatements}
}

export async function down(
    db: Database,
): Promise<void> {
${downStatements}
}
`;
}

function generateStatements(
    statements: string[],
): string {
    return statements
        .map(
            sql => `    await db.execute(\`
        ${sql.replace(/\n/g, "\n        ")}
    \`);`,
        )
        .join("\n\n");
}