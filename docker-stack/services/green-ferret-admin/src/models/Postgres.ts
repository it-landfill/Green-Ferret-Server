import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';
import {
  CommunicationProtocol,
  DeviceModel,
  DistanceMethod,
  TriggerType,
} from './DeviceModel';

// SQLConfig interface, used to store SQL configuration
interface SQLConfig {
  host: string;
  db: string;
  username: string;
  password: string;
}

// Sequelize object, used to connect to the database
let dbmsInstance: Sequelize | undefined;

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
  obj: unknown,
): obj is DeviceConfigAttributes {
  // Check if the object is an object and not null
  if (typeof obj !== 'object' || obj === null) return false;

  // Check if the object has all the required keys
  for (const key of [
    'protocol',
    'trigger',
    'distanceMethod',
    'distance',
    'time',
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
  const host = process.env.POSTGRES_HOST || 'localhost';
  const db = process.env.POSTGRES_DB || 'Green-Ferret';
  const username = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;

  if (!process.env.POSTGRES_HOST)
    console.warn('POSTGRES_HOST not set, using default value (localhost)');
  if (!process.env.POSTGRES_DB)
    console.warn('POSTGRES_DB not set, using default value (Green-Ferret)');
  if (!process.env.POSTGRES_USER)
    console.warn('POSTGRES_USER not set, exiting...');
  if (!process.env.POSTGRES_PASSWORD)
    console.warn('POSTGRES_PASSWORD not set, exiting...');
  if (username === undefined || password === undefined) {
    throw new Error('Missing Postgres configuration. Please set the ENV variables POSTGRES_USER and POSTGRES_PASSWORD');
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
  dbmsInstance = new Sequelize(config.db, config.username, config.password, {
    host: config.host,
    dialect: 'postgres',
    logging: false,
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
    { sequelize: dbmsInstance, tableName: 'Config' },
  );
}

/**
 * Connects to the database
 */
export async function dbConnect() {
    if (dbmsInstance === undefined) dbInitialize();
    if (dbmsInstance) {
      await dbmsInstance.authenticate();
      deviceConfig.sync({ alter: true });
    } else throw new Error('dbmsInstance is undefined');
    console.log('Connection has been established successfully.');
}

/**
 * Disconnects from the database
 */
export async function dbDisconnect() {
  if (dbmsInstance) await dbmsInstance.close();
}

function deviceConfigToDeviceModel(device: DeviceConfig): DeviceModel {
  // Convert deviceConfig to DeviceModel
  return {
    id: device.deviceID,
    config: {
      protocol: device.protocol,
      trigger: device.trigger,
      distanceMethod: device.distanceMethod,
      distance: device.distance,
      time: device.time,
    },
  };
}

function deviceModelToDeviceConfigAttrs(
  device: DeviceModel,
): DeviceConfigAttributes {
  return {
    protocol: device.config.protocol,
    trigger: device.config.trigger,
    distanceMethod: device.config.distanceMethod,
    distance: device.config.distance,
    time: device.config.time,
  };
}

export async function dbGetAllDeviceIDs(): Promise<string[]> {
  // Check if the database is initialized
  if (dbmsInstance === undefined) await dbConnect();

  // Get all device IDs
  if (deviceConfig) {
    const result = await deviceConfig.findAll({
      attributes: ['deviceID'],
    });
    return result.map((value) => value.deviceID);
  } else return [];
}

export async function dbGetDevice(
  id: string,
): Promise<DeviceModel | undefined> {
  // Check if the database is initialized
  if (dbmsInstance === undefined) dbConnect();

  // Get the device
  const result = await deviceConfig.findOne({
    where: { deviceID: id },
  });

  // Check if the device exists
  if (result === null) return undefined;

  return deviceConfigToDeviceModel(result);
}

export async function dbSaveDevice(device: DeviceModel) {
  const formattedDevice: DeviceConfigAttributes =
    deviceModelToDeviceConfigAttrs(device);

  // Check if the database is initialized
  if (dbmsInstance === undefined) dbConnect();

  // save the device
  await deviceConfig.upsert({
    ...formattedDevice,
    deviceID: device.id,
    edited: true,
  });
}
