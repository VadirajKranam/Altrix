import {
    getOrCreateMetadata,
} from "../metadata/registry.js";

export function PrimaryKey() {
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

        metadata.primaryKey = {
            columns: [columnName],
        };
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