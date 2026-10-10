import {
    chdir,
    cwd,
} from "node:process";

import {
    afterEach,
    describe,
    expect,
    it,
} from "vitest";

import {
    findHeadRevisions,
    listRevisionNodes,
} from "../../src/migration/revisions.js";

import {
    createTestWorkspace,
    writeMigrationPair,
} from "../helpers/workspace.js";

let previousCwd = cwd();

afterEach(() => {
    chdir(previousCwd);
});

describe("revisions graph", () => {
    it("builds linear chain and finds head", async () => {
        previousCwd = cwd();
        const workspace = await createTestWorkspace();

        try {
            await writeMigrationPair(
                workspace.root,
                "20261001010101_create_users",
                null,
                "SELECT 1;",
            );

            await writeMigrationPair(
                workspace.root,
                "20261001020202_add_posts",
                "20261001010101_create_users",
                "SELECT 2;",
            );

            chdir(workspace.root);

            const nodes = await listRevisionNodes();
            const heads = await findHeadRevisions();

            expect(nodes).toHaveLength(2);
            expect(heads).toEqual([
                "20261001020202_add_posts",
            ]);
        } finally {
            chdir(previousCwd);
            await workspace.cleanup();
        }
    });
});
