import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

// SQLConfig interface, used to store SQL configuration
interface SQLConfig {
  host: string;
  db: string;
  username: string;
  password: string;
}

// Sequelize object, used to connect to the database
let sequelize: Sequelize;

// DeviceConfigAttributes interface, used to store device configuration
export interface DeviceConfigAttributes {
  protocol: number;
  trigger: number;
  distanceMethod: number;
  distance: number;
  time: number;
}

/**
 * Checks if an object is a DeviceConfigAttributes object
 * @param obj The object to check
 * @returns True if the object is a DeviceConfigAttributes object, false otherwise
 */
export function isDeviceConfigAttributes(
  obj: unknown
): obj is DeviceConfigAttributes {
  // Check if the object is an object and not null
  if (typeof obj !== "object" || obj === null) return false;

  // Check if the object has all the required keys
  for (const key of [
    "protocol",
    "trigger",
    "distanceMethod",
    "distance",
    "time",
  ]) {
    if (!(key in obj)) return false;
  }

  return true;
}

// DeviceConfig class, used to store device configuration.
class DeviceConfig
  extends Model<
    InferAttributes<DeviceConfig>,
    InferCreationAttributes<DeviceConfig>
  >
  implements DeviceConfigAttributes
{
  declare deviceID: string;
  declare protocol: number;
  declare trigger: number;
  declare distanceMethod: number;
  declare distance: number;
  declare time: number;
  declare edited: boolean;
}

// instance ot the DeviceConfig class, used to store device configuration. This will represent the table in the database
let deviceConfig: typeof DeviceConfig;

/**
 * Generates a SQLConfig object from environment variables
 * ENV variables:
 * - POSTGRES_HOST: Postgres host (default: localhost)
 * - POSTGRES_DB: Postgres database name (default: Green-Ferret)
 * - POSTGRES_USER: Postgres username
 * - POSTGRES_PASSWORD: Postgres password
 * @returns SQLConfig object with values from environment variables
 */
function generateConfig(): SQLConfig {
  const host = process.env.POSTGRES_HOST || "localhost";
  const db = process.env.POSTGRES_DB || "Green-Ferret";
  const username = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;

  if (!process.env.POSTGRES_HOST)
    console.warn("POSTGRES_HOST not set, using default value (localhost)");
  if (!process.env.POSTGRES_DB)
    console.warn("POSTGRES_DB not set, using default value (Green-Ferret)");
  if (!process.env.POSTGRES_USER)
    console.warn("POSTGRES_USER not set, exiting...");
  if (!process.env.POSTGRES_PASSWORD)
    console.warn("POSTGRES_PASSWORD not set, exiting...");
  if (username === undefined || password === undefined) {
    throw new Error("Missing Postgres configuration");
  }

  return { host: host, db: db, username: username, password: password };
}

/**
 * Initializes the database and the models
 */
export function dbInitialize() {
  // Generate config from environment variables
  const config = generateConfig();

  // Initialize Sequelize
  sequelize = new Sequelize(config.db, config.username, config.password, {
    host: config.host,
    dialect: "postgres",
  });

  // Initialize models
  deviceConfig = DeviceConfig.init(
    {
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
    },
    { sequelize, tableName: "Config" }
  );
}

/**
 * Connects to the database
 */
export async function dbConnect() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
  deviceConfig.sync({ alter: true });
}

/**
 * Disconnects from the database
 */
export async function dbDisconnect() {
  await sequelize.close();
}

/**
 * Gets the configuration of a device
 * @param deviceID ID of the device to get the configuration of
 * @returns DeviceConfigAttributes object with the configuration of the device
 */
export async function dbGetConfig(
  deviceID: string
): Promise<DeviceConfigAttributes | undefined> {
  const result = await deviceConfig.findOne({
    where: {
      deviceID: deviceID,
    },
  });
  return result != null ? result : undefined;
}

/**
 * Gets the configuration of all the devices that have been edited (see Green-Ferret-Admin)
 * @returns Array of DeviceConfigAttributes objects with the configuration of all the devices with the edited flag set to true
 */
export async function dbGetAllEdited(): Promise<DeviceConfig[] | undefined> {
  const result = await deviceConfig.findAll({
    where: {
      edited: true,
    },
  });
  return result != null ? result : undefined;
}

/**
 * Saves the configuration of a device (creates a new entry if it doesn't exist, updates it otherwise)
 * @param deviceID ID of the device to save the configuration of
 * @param config DeviceConfigAttributes object with the configuration to save
 */
export async function dbSaveConfig(
  deviceID: string,
  config: DeviceConfigAttributes
) {
  await deviceConfig.upsert({
    ...config,
    deviceID: deviceID,
    edited: false,
  });
}
