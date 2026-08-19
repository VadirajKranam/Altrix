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

    const contents = JSON.stringify(
        schema,
        null,
        2,
    );

    await writeFile(
        filePath,
        contents,
        "utf8",
    );
}

export async function loadSchemaSnapshot(
    filePath: string,
): Promise<Schema | null> {
    try {
        const contents = await readFile(
            filePath,
            "utf8",
        );

        return JSON.parse(
            contents,
        ) as Schema;
    } catch (error: any) {
        if (error.code === "ENOENT") {
            return null;
        }

        throw error;
    }
}