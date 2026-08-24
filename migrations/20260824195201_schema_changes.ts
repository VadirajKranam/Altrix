import type {
    Database,
} from "../src/database/types.js";

export const name = "20260824195201_schema_changes";

export async function up(
    db: Database,
): Promise<void> {
    await db.execute(`
        ALTER TABLE users
        ADD COLUMN age INT NOT NULL;
    `);
}

export async function down(
    db: Database,
): Promise<void> {
    await db.execute(`
        ALTER TABLE users
        DROP COLUMN age;
    `);
}
