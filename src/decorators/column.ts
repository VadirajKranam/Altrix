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

        metadata.columns.set(
            columnName,
            {
                name: columnName,
                type,
                nullable:
                    options.nullable ?? false,
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