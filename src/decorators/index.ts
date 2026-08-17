import {
    getOrCreateMetadata,
} from "../metadata/registry.js";

export interface IndexOptions {
    columns: string[];
    name?: string;
    unique?: boolean;
}

export function Index(
    options: IndexOptions,
) {
    return function (
        _target: Function,
        context: ClassDecoratorContext,
    ): void {
        const metadata =
            getOrCreateMetadata(
                context.metadata,
            );

        const columns =
            options.columns.map(toSnakeCase);

        const name =
            options.name ??
            generateIndexName(
                columns,
            );

        metadata.indexes.push({
            name,
            columns,
            unique:
                options.unique ?? false,
        });
    };
}

function toSnakeCase(
    value: string,
): string {
    return value
        .replace(
            /[A-Z]/g,
            letter =>
                `_${letter.toLowerCase()}`,
        )
        .replace(/^_/, "");
}

function generateIndexName(
    columns: string[],
): string {
    return `idx_${columns.join("_")}`;
}