import {
    readdir,
    readFile,
} from "node:fs/promises";

import {
    resolve,
    relative,
} from "node:path";

import {
    config,
} from "../config.js";

export async function loadModels(
    directory = config.models,
): Promise<void> {
    const modelDirectory =
        resolve(directory);

    const files =
        await readdir(
            modelDirectory,
            {
                withFileTypes: true,
            },
        );

    for (const file of files) {
        if (!file.isFile()) {
            continue;
        }

        if (!file.name.endsWith(".ts")) {
            continue;
        }

        if (file.name.endsWith(".d.ts")) {
            continue;
        }

        const sourcePath =
            resolve(
                modelDirectory,
                file.name,
            );

        const sourceContent =
            await readFile(
                sourcePath,
                "utf8",
            );

        if (!isModelFile(sourceContent)) {
            continue;
        }

        const relativePath =
            relative(
                process.cwd(),
                sourcePath,
            );

        const compiledPath =
            resolve(
                "dist",
                relativePath
                    .replace(
                        /\.ts$/,
                        ".js",
                    ),
            );

        await import(
            compiledPath
        );
    }
}

function isModelFile(
    sourceContent: string,
): boolean {
    return sourceContent.includes("@Table(");
}