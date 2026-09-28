import {
    getOrCreateMetadata,
} from "../metadata/registry.js";

import type {
    ForeignKeySchema,
} from "../schema/types.js";

export interface ForeignKeyOptions {
    table: string;
    column?: string;
    onDelete?: ForeignKeyAction;
    onUpdate?: ForeignKeyAction;
}

export type ForeignKeyAction =
    | "CASCADE"
    | "SET NULL"
    | "SET DEFAULT"
    | "RESTRICT"
    | "NO ACTION";

export function ForeignKey(
    options: ForeignKeyOptions,
) {
    return function (
        _value: undefined,
        context: ClassFieldDecoratorContext,
    ): void {
        const metadata =
            getOrCreateMetadata(
                context.metadata,
            );

        const columnName =
            toSnakeCase(
                String(context.name),
            );

        const column =
            metadata.columns.get(columnName) ?? {
                name: columnName,
                type: "integer",
                nullable: false,
            };

        const relation: ForeignKeySchema = {
            table: options.table,
            column: options.column ?? "id",
            ...(options.onDelete !== undefined
                ? {
                    onDelete: options.onDelete,
                }
                : {}),
            ...(options.onUpdate !== undefined
                ? {
                    onUpdate: options.onUpdate,
                }
                : {}),
        };

        metadata.columns.set(
            columnName,
            {
                ...column,
                foreignKey: relation,
            },
        );
    };
}

function toSnakeCase(
    value: string,
): string {
    return value
        .replace(
            /[A-Z]/g,
            letter => `_${letter.toLowerCase()}`,
        )
        .replace(/^_/, "");
}
