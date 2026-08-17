import type {
    ColumnSchema,
    IndexSchema,
    PrimaryKeySchema,
    Schema,
    TableSchema,
} from "../schema/types.js";

export type ClassConstructor =
    abstract new (...args: any[]) => any;

export const ALTRIX_METADATA =
    Symbol("altrix:metadata");

export interface AltrixClassMetadata {
    table?: TableSchema;
    columns: Map<string, ColumnSchema>;
    primaryKey?: PrimaryKeySchema;
    indexes: IndexSchema[];
}

export function getOrCreateMetadata(
    metadata: DecoratorMetadataObject | undefined,
): AltrixClassMetadata {
    if (!metadata) {
        throw new Error(
            "Altrix requires decorator metadata support.",
        );
    }

    const existing =
        metadata[ALTRIX_METADATA];

    if (existing) {
        return existing as AltrixClassMetadata;
    }

    const value: AltrixClassMetadata = {
        columns: new Map<string, ColumnSchema>(),
        indexes: [],
    };

    metadata[ALTRIX_METADATA] = value;

    return value;
}

class MetadataRegistry {
    private readonly tables =
        new Map<
            ClassConstructor,
            AltrixClassMetadata
        >();

    registerTable(
        target: ClassConstructor,
        metadata: DecoratorMetadataObject | undefined,
        name: string,
    ): void {
        const classMetadata =
            getOrCreateMetadata(metadata);

        if (classMetadata.table) {
            throw new Error(
                `Table already registered: ${target.name}`,
            );
        }

        classMetadata.table = {
            name,
            columns: [],
            indexes: [],
        };

        this.tables.set(
            target,
            classMetadata,
        );
    }

    getSchema(): Schema {
        const tables: TableSchema[] = [];

        for (const metadata of this.tables.values()) {
            if (!metadata.table) {
                continue;
            }

            tables.push({
                ...metadata.table,

                columns: Array.from(
                    metadata.columns.values(),
                ),

                indexes: metadata.indexes,

                primaryKey:
                    metadata.primaryKey,
            });
        }

        return {
            tables,
        };
    }
}

export const registry =
    new MetadataRegistry();