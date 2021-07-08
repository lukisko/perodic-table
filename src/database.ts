import postgres from "pg";

export default class Database {
	constructor(private databaseUrl: string) {

	}

	public loadFromDatabase(sqlCommand: string, arg: string[]): Promise<any[]> {
		const client = this.getDatabaseClient();
		const returnArr: any[] = [];

		client.connect();
		const returnValue = new Promise<any[]>((resolve, reject) => {
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

	public saveToDatabase(sqlCommand: string, arg: any[]): Promise<any> {
		const client = this.getDatabaseClient();

		const returnPromise = new Promise<any>((resolve, reject) => {
			client.connect();
			client.query(sqlCommand, arg, (err, res) => {
				if (err) { reject(err) }
				if (res) { resolve(res.rows) }
				client.end();
			});
		});

		return returnPromise;
	}

	private getDatabaseClient(): postgres.Client {
		let databaseURL;
		if (process.env.DATABASE_URL) {
			databaseURL = process.env.DATABASE_URL;
		} else {
			databaseURL = this.databaseUrl;
		}
		const client = new postgres.Client({
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
