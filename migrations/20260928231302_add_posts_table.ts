import type {
    Database,
} from "../src/database/types.js";

export const name = "20260928231302_add_posts_table";

export async function up(
    db: Database,
): Promise<void> {
    await db.execute(`
        CREATE TABLE posts (
            id CHAR(36) NOT NULL,
            title VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            user_id CHAR(36) NOT NULL,
            PRIMARY KEY (id),
            CONSTRAINT fk_posts_user_id
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);

    await db.execute(`
        CREATE TABLE users (
            id CHAR(36) NOT NULL,
            first_name VARCHAR(200) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL,
            age INT NOT NULL,
            PRIMARY KEY (id)
        );
    `);
}

export async function down(
    db: Database,
): Promise<void> {
    await db.execute(`
        DROP TABLE users;
    `);

    await db.execute(`
        DROP TABLE posts;
    `);
}
