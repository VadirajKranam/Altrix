import {
    findHeadRevisions,
} from "../../migration/revisions.js";

export async function showMigrationHeads(): Promise<void> {
    const heads =
        await findHeadRevisions();

    if (heads.length === 0) {
        console.log(
            "No migration heads found.",
        );

        return;
    }

    for (const head of heads.sort((a, b) => a.localeCompare(b))) {
        console.log(
            head,
        );
    }
}
