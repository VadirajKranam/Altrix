import {
    mkdir,
    readFile,
    writeFile,
} from "node:fs/promises";

import {
    dirname,
} from "node:path";

import type {
    Schema,
} from "./types.js";

export async function saveSchemaSnapshot(
    filePath: string,
    schema: Schema,
): Promise<void> {
    await mkdir(
        dirname(filePath),
        {
            recursive: true,
        },
    );

    await writeFile(
        filePath,
        JSON.stringify(
            schema,
            null,
            2,
        ),
        "utf8",
    );
}

export async function loadSchemaSnapshot(
    filePath: string,
): Promise<Schema | null> {
    try {
        const content =
            await readFile(
                filePath,
                "utf8",
            );

        return JSON.parse(
            content,
        ) as Schema;
    } catch (error: unknown) {
        const code =
            (
                error as {
                    code?: string;
                }
            ).code;

        if (code === "ENOENT") {
            return null;
        }

        throw error;
    }
}