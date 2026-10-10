import {
    Client,
} from "pg";

import type {
    Database,
} from "./types.js";

export interface PostgresDatabase extends Database {
    close(): Promise<void>;
}

export interface PostgresDatabaseOptions {
    connectionString?: string;
}

export async function createPostgresDatabase(
    options: PostgresDatabaseOptions = {},
): Promise<PostgresDatabase> {
    const connectionString =
        options.connectionString ??
        process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error(
            "DATABASE_URL is required for PostgreSQL adapter.",
        );
    }

    const client = new Client({
        connectionString,
    });

    await client.connect();

    return {
        async execute(sql: string): Promise<void> {
            await client.query(sql);
        },

        async query<T = Record<string, unknown>>(
            sql: string,
        ): Promise<T[]> {
            const result =
                await client.query(sql);

            return result.rows as T[];
        },

        async close(): Promise<void> {
            await client.end();
        },
    };
}
