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
    } else {
        console.error(
            "Usage: altrix migrate create <name>",
        );

        process.exit(1);
    }
} else {
    console.error(
        "Usage: altrix migrate create <name>",
    );

    process.exit(1);
}