import {
    listRevisionNodes,
} from "../../migration/revisions.js";

export async function showMigrationHistory(): Promise<void> {
    const nodes =
        await listRevisionNodes();

    if (nodes.length === 0) {
        console.log(
            "No migrations found.",
        );

        return;
    }

    for (const node of nodes) {
        console.log(
            `${node.revision} (down: ${node.downRevision ?? "base"})`,
        );
    }
}
