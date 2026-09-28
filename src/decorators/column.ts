import {
    getOrCreateMetadata,
} from "../metadata/registry.js";

import type {
    ColumnType,
} from "../schema/types.js";

export interface ColumnOptions {
    length?: number;
    nullable?: boolean;
    default?: unknown;
}

export function Column(
    type: ColumnType,
    options: ColumnOptions = {},
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

        const existingColumn =
            metadata.columns.get(columnName);

        metadata.columns.set(
            columnName,
            {
                ...(existingColumn ?? {
                    name: columnName,
                    type,
                    nullable:
                        options.nullable ?? false,
                }),
                name: columnName,
                type,
                nullable:
                    options.nullable ?? existingColumn?.nullable ?? false,
                ...(options.length !== undefined
                    ? {
                        length: options.length,
                    }
                    : {}),
                ...(options.default !== undefined
                    ? {
                        default: options.default,
                    }
                    : {}),
                ...(existingColumn?.foreignKey !== undefined
                    ? {
                        foreignKey:
                            existingColumn.foreignKey,
                    }
                    : {}),
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