#!/usr/bin/env node

const args = process.argv.slice(2);

const [command, subcommand, ...rest] = args;

if (command === "migrate") {
    if (subcommand === "create") {
        const name = rest[0];

        if (!name) {
            console.error(
                "Migration name is required.",
            );

            process.exit(1);
        }

        const {
            createMigration,
        } = await import(
            "./commands/migrate.js"
        );

        await createMigration(name);
    } else if (subcommand === "upgrade") {
        const target =
            rest[0] ?? "head";

        const adapterFlagIndex =
            rest.findIndex(
                value => value === "--adapter",
            );

        const adapterPath =
            adapterFlagIndex >= 0
                ? rest[adapterFlagIndex + 1]
                : undefined;

        const {
            upgradeMigrations,
        } = await import(
            "./commands/upgrade.js"
        );

        await upgradeMigrations(
            target,
            adapterPath,
        );
    } else {
        console.error(
            "Usage: altrix migrate create <name> | altrix migrate upgrade [head|revision] [--adapter <path>]",
        );

        process.exit(1);
    }
} else {
    console.error(
        "Usage: altrix migrate create <name> | altrix migrate upgrade [head|revision] [--adapter <path>]",
    );

    process.exit(1);
}