import {
    randomUUID,
} from "node:crypto";

import {
    describe,
    expect,
    it,
} from "vitest";

import {
    createPostgresDatabase,
} from "../../src/database/postgres.js";

describe("postgres adapter integration", () => {
    it("executes SQL and returns query rows", async () => {
        const databaseUrl =
            process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error(
                "DATABASE_URL is required for integration tests.",
            );
        }

        const db =
            await createPostgresDatabase({
                connectionString: databaseUrl,
            });

        const tableName =
            `altrix_test_${randomUUID().replace(/-/g, "")}`;

        try {
            await db.execute(`
                CREATE TABLE ${tableName} (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL
                );
            `);

            await db.execute(`
                INSERT INTO ${tableName} (name)
                VALUES ('ok');
            `);

            const rows = await db.query<{
                name: string;
            }>(`
                SELECT name
                FROM ${tableName};
            `);

            expect(rows).toEqual([
                {
                    name: "ok",
                },
            ]);
        } finally {
            await db.execute(`DROP TABLE IF EXISTS ${tableName};`);
            await db.close();
        }
    });
});
