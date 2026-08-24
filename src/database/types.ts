export interface Database {
    execute(
        sql: string,
    ): Promise<void>;
}