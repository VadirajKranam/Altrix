import {
    createPostgresDatabase,
} from "../src/database/postgres.js";

const database =
    await createPostgresDatabase();

export default database;
