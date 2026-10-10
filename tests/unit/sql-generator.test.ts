import {
    describe,
    expect,
    it,
} from "vitest";

import type {
    MigrationOperation,
} from "../../src/migration/operations.js";

import {
    generateUpSql,
} from "../../src/sql/mysql/generator.js";

describe("mysql sql generator", () => {
    it("emits foreign key constraints for create table", () => {
        const operations: MigrationOperation[] = [
            {
                type: "CREATE_TABLE",
                table: {
                    name: "posts",
                    columns: [
                        {
                            name: "id",
                            type: "uuid",
                            nullable: false,
                        },
                        {
                            name: "user_id",
                            type: "uuid",
                            nullable: false,
                            foreignKey: {
                                table: "users",
                                column: "id",
                                onDelete: "CASCADE",
                                onUpdate: "CASCADE",
                            },
                        },
                    ],
                    indexes: [],
                    primaryKey: {
                        columns: ["id"],
                    },
                },
            },
        ];

        const sql = generateUpSql(operations)[0]!;

        expect(sql).toContain("CONSTRAINT fk_posts_user_id");
        expect(sql).toContain("FOREIGN KEY (user_id) REFERENCES users (id)");
        expect(sql).toContain("ON DELETE CASCADE");
        expect(sql).toContain("ON UPDATE CASCADE");
    });
});
