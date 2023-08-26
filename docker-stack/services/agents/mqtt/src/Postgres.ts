import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";

interface SQLConfig {
	  host: string;
	  db: string;
	  username: string;
	  password: string;
}

const sqlConfig = {
  host: "localhost",
  db: "Green-Ferret",
  username: "greenferret",
  password: "example",
};

const sequelize = new Sequelize(
  sqlConfig.db,
  sqlConfig.username,
  sqlConfig.password,
  {
    host: sqlConfig.host,
    dialect: "postgres",
  }
);

export interface DeviceConfigAttributes {
	  protocol: number;
	  trigger: number;
	  distanceMethod: number;
	  distance: number;
	  time: number;
}

export function isDeviceConfigAttributes(obj: unknown): obj is DeviceConfigAttributes { //magic happens here
	if (typeof obj !== "object" || obj === null) return false;

	for (const key of ["protocol", "trigger", "distanceMethod", "distance", "time"]) {
		if (!(key in obj)) return false;
	}

    return true;
}

class DeviceConfig extends Model<InferAttributes<DeviceConfig>, InferCreationAttributes<DeviceConfig>> implements DeviceConfigAttributes {
	declare deviceID: string;
	declare protocol: number;
	declare trigger: number;
	declare distanceMethod: number;
	declare distance: number;
	declare time: number;
	declare edited: boolean;
}

const deviceConfig = DeviceConfig.init({
  deviceID: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
  protocol: {
    type: DataTypes.SMALLINT,
    allowNull: false,
  },
  trigger: {
    type: DataTypes.SMALLINT,
    allowNull: false,
  },
  distanceMethod: {
    type: DataTypes.SMALLINT,
    allowNull: false,
  },
  distance: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  time: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  edited: {
	type: DataTypes.BOOLEAN,
	allowNull: false,
	defaultValue: false,
	  },
}, {
	sequelize,
	tableName: "Config",
});

function generateConfig(): SQLConfig {
	  const host = process.env.POSTGRES_HOST || "localhost";
  const db = process.env.POSTGRES_DB || "Green-Ferret";
  const username = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;

  if (!process.env.POSTGRES_HOST)
    console.warn("POSTGRES_HOST not set, using default value (localhost)");
  if (!process.env.POSTGRES_DB)
    console.warn("POSTGRES_DB not set, using default value (Green-Ferret)");
  if (username === undefined || password === undefined) {
	throw new Error("Missing Postgres configuration");
  }

  return {
	host: host,
	db: db,
	username: username,
	password: password,
  };
}

export async function dbConnect() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
  deviceConfig.sync({alter: true});
}

export async function dbDisconnect() {
  await sequelize.close();
}

export async function dbGetConfig(deviceID: string): Promise<DeviceConfigAttributes | undefined> {
  const result = await deviceConfig.findOne({ where: { deviceID: deviceID } });
  return result!=null ? result : undefined;
}

export async function dbGetAllEdited(): Promise<DeviceConfig[] | undefined> {
  const result = await deviceConfig.findAll({ where: { edited: true } });
  return result!=null ? result : undefined;
}

export async function dbSaveConfig(deviceID: string, config: DeviceConfigAttributes) {
  await deviceConfig.upsert({...config, deviceID: deviceID, edited: false});
}
