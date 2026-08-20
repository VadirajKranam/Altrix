export function createMigrationName(
    name: string,
): string {
    const timestamp =
        createTimestamp();

    const normalizedName =
        name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");

    return `${timestamp}_${normalizedName}`;
}

function createTimestamp(): string {
    const now = new Date();

    const pad = (value: number) =>
        String(value).padStart(2, "0");

    return [
        now.getFullYear(),
        pad(now.getMonth() + 1),
        pad(now.getDate()),
        pad(now.getHours()),
        pad(now.getMinutes()),
        pad(now.getSeconds()),
    ].join("");
}