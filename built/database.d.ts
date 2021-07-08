export default class Database {
    private databaseUrl;
    constructor(databaseUrl: string);
    loadFromDatabase(sqlCommand: string, arg: string[]): Promise<any[]>;
    saveToDatabase(sqlCommand: string, arg: any[]): Promise<any>;
    private getDatabaseClient;
}
//# sourceMappingURL=database.d.ts.map