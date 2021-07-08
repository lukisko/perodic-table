"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = __importDefault(require("pg"));
class Database {
    constructor(databaseUrl) {
        this.databaseUrl = databaseUrl;
    }
    loadFromDatabase(sqlCommand, arg) {
        const client = this.getDatabaseClient();
        const returnArr = [];
        client.connect();
        const returnValue = new Promise((resolve, reject) => {
            client.query(sqlCommand, arg, (err, res) => {
                if (err) {
                    reject(err);
                }
                for (const row of res.rows) {
                    returnArr.push(row);
                }
                client.end();
                resolve(returnArr);
            });
        });
        return returnValue;
    }
    saveToDatabase(sqlCommand, arg) {
        const client = this.getDatabaseClient();
        const returnPromise = new Promise((resolve, reject) => {
            client.connect();
            client.query(sqlCommand, arg, (err, res) => {
                if (err) {
                    reject(err);
                }
                if (res) {
                    resolve(res.rows);
                }
                client.end();
            });
        });
        return returnPromise;
    }
    getDatabaseClient() {
        let databaseURL;
        if (process.env.DATABASE_URL) {
            databaseURL = process.env.DATABASE_URL;
        }
        else {
            databaseURL = this.databaseUrl;
        }
        const client = new pg_1.default.Client({
            connectionString: databaseURL,
            ssl: {
                rejectUnauthorized: false,
            }
        });
        return client;
        /*'postgres://huicwczlmsgele:
        1d083f5711069c994fe5ee8c59ef3023f492bc6da48b0e970c620f4a7aac3cc5
        @ec2-54-78-36-245.eu-west-1.compute.amazonaws.com:5432/d9tje5dt0llf66'*/
    }
}
exports.default = Database;
//# sourceMappingURL=database.js.map