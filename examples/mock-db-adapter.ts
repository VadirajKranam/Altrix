import type {
    Database,
} from "../src/database/types.js";

export const database: Database = {
    async execute(sql: string): Promise<void> {
        console.log("[SQL]");
        console.log(sql.trim());
    },
};
