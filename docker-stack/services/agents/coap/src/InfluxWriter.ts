import {InfluxDB, Point, ClientOptions} from "@influxdata/influxdb-client";

/**
 * This is a wrapper for the InfluxDB client.
 *
 * It is used to write data to the InfluxDB database used for Green-Ferret project.
 * Note that this has some hardcoded values for the project.
 *
 * Environment variables:
 * - INFLUXDB_HOST: InfluxDB host (default: localhost)
 * - INFLUXDB_PORT: InfluxDB port (default: 8086)
 * - INFLUXDB_ORG: InfluxDB organization (default: IT-Landfill)
 * - INFLUXDB_BUCKET: InfluxDB bucket (default: Green-Ferret)
 */
export module InfluxWriter {
	export var config: InfluxConfig;
	let client: InfluxDB;

	type InfluxConfig = {
		host: string;
		port: string;
		org: string;
		bucket: string;
	};

	type DataType = {
		[key: string]: BigInt | number | string | boolean
	};
	type TagType = {
		[key: string]: string
	};

	function generateConfig(): InfluxConfig {
		const host = process.env.INFLUXDB_HOST || "localhost";
		const port = process.env.INFLUXDB_PORT || "8086";
		const org = process.env.INFLUXDB_ORG || "IT-Landfill";
		const bucket = process.env.INFLUXDB_BUCKET || "Green-Ferret";

		if (!process.env.INFLUXDB_HOST) 
			console.warn("INFLUXDB_HOST not set, using default value (localhost)");
		if (!process.env.INFLUXDB_PORT) 
			console.warn("INFLUXDB_PORT not set, using default value (8086)");
		if (!process.env.INFLUXDB_ORG) 
			console.warn("INFLUXDB_ORG not set, using default value (IT-Landfill)");
		if (!process.env.INFLUXDB_BUCKET) 
			console.warn("INFLUXDB_BUCKET not set, using default value (Green-Ferret)");
		
		return {host, port, org, bucket};
	}

	/**
	 * Initialize config andf generate a new InfluxDB client with the given token
	 * @param token InfluxDB token
	 */
	export function initializeClient(token : string) {
		config = generateConfig();
		const options: ClientOptions = {
			url: `http://${config.host}:${config.port}`,
			token: token
		};
		client = new InfluxDB(options);
	}

	/**
	 * Write data to the InfluxDB database
	 * @param data Object with the data to write
	 * @param tags (Optional) Object with the tags to add to the data (e.g. {sensor: "sensor1"}
	 * @param org (Optional) Organization to write to. If not set, the default value from the config will be used
	 * @param bucket (Optional) Bucket to write to. If not set, the default value from the config will be used
	 */
	export function writeData(data : DataType, tags : TagType = {}, org? : string, bucket? : string) {
		const writeClient = client.getWriteApi(org || config.org, bucket || config.bucket, "ms");

		const point = new Point("sensor_data");

		for (const tag in tags) {
			point.tag(tag, tags[tag]);
		}

		for (const field in data) {
			switch (typeof data[field]) {
				case "bigint":
					point.intField(field, data[field]);
					break;
				case "number":
					if (Number.isInteger(data[field])) 
						point.intField(field, data[field]);
					else 
						point.floatField(field, data[field]);
					break;
				case "string":
					point.stringField(field, data[field]);
					break;
				case "boolean":
					point.booleanField(field, data[field]);
					break;
				default:
					// Should never happen since we check the type in the function signature... but just in case
					console.warn(`Unknown type for field ${field}. type: ${typeof data[field]}`);
			}
		}

		writeClient.writePoint(point);
		writeClient.flush();
	}
}
