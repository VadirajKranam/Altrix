import {
    chdir,
    cwd,
} from "node:process";

import {
    readFile,
} from "node:fs/promises";

import {
    join,
} from "node:path";

import {
    afterEach,
    describe,
    expect,
    it,
} from "vitest";

import type {
    Database,
} from "../../src/database/types.js";

import {
    getCurrentRevision,
    upgradeToRevision,
} from "../../src/migration/runner.js";

import {
    createTestWorkspace,
    writeMigrationPair,
} from "../helpers/workspace.js";

class InMemoryDatabase implements Database {
    public readonly executed: string[] = [];

    private readonly rows: {
        version_num: string;
    }[] = [];

    async execute(sql: string): Promise<void> {
        this.executed.push(sql.trim());

        if (sql.includes("DELETE FROM altrix_version")) {
            this.rows.length = 0;
        }

        const insertMatch = sql.match(
            /VALUES\s*\('([^']+)'\)/,
        );

        if (insertMatch) {
            this.rows.push({
                version_num: insertMatch[1]!,
            });
        }
    }

    async query<T = Record<string, unknown>>(): Promise<T[]> {
        return this.rows as unknown as T[];
    }
}

let previousCwd = cwd();

afterEach(() => {
    chdir(previousCwd);
});

describe("migration runner", () => {
    it("upgrades to head and persists state", async () => {
        previousCwd = cwd();
        const workspace = await createTestWorkspace();

        try {
            await writeMigrationPair(
                workspace.root,
                "20261001010101_create_users",
                null,
                "CREATE TABLE users (id INT);",
            );

            await writeMigrationPair(
                workspace.root,
                "20261001020202_add_posts",
                "20261001010101_create_users",
                "CREATE TABLE posts (id INT);",
            );

            chdir(workspace.root);

            const db = new InMemoryDatabase();

            const result = await upgradeToRevision(
                db,
                "head",
            );

            expect(result.appliedRevisions).toEqual([
                "20261001010101_create_users",
                "20261001020202_add_posts",
            ]);

            const statePath = join(
                workspace.root,
                ".altrix",
                "revisions.json",
            );

            const state = JSON.parse(
                await readFile(statePath, "utf8"),
            ) as {
                currentRevision: string;
            };

            expect(state.currentRevision).toBe(
                "20261001020202_add_posts",
            );

            const current = await getCurrentRevision(db);
            expect(current).toBe(
                "20261001020202_add_posts",
            );
        } finally {
            chdir(previousCwd);
            await workspace.cleanup();
        }
    });
});
