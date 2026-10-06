export interface Database {
    execute(
        sql: string,
    ): Promise<void>;

    query?<T = Record<string, unknown>>(
        sql: string,
    ): Promise<T[]>;
}