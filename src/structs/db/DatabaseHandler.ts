import { Database as sql3DB } from "sqlite3/index";
import { EventEmitter } from "events";
import { deserialize, serialize } from "v8";
import { deflateRawSync, inflateRawSync, Z_BEST_COMPRESSION } from "zlib";

const DRIVER = `sqlite`;
const PATH_FOLDER = `../../../data`;

module DataComponents {
  export interface Key {
    key: string
  }

  export interface Value<V> {
    value: V
  }

  export interface Expiry {
    expiry: number
  }
}

type SqlQueryRow = DataComponents.Key & DataComponents.Value<string>;

type DataPacket<V> = DataComponents.Value<V> & DataComponents.Expiry;

type DataEntry<V> = DataComponents.Key & DataPacket<V>

class DatabaseHandler {

  readonly busyTimeout: number = 0;
  readonly db: Promise<sql3DB>;
  readonly dialect: string = `sqlite`;
  readonly keySize: number = 255;
  readonly table: string = `default`;
  readonly ttl: number = 0;
  readonly uri: string;

  constructor(
    dataFile: string,
    readonly namespace: string
  ) {

    this.uri = `${PATH_FOLDER}/${dataFile}`;

    const createTable: string = `CREATE TABLE '${
      this.table
    }' ('key' VARCHAR(${
      this.keySize
    }), 'value' TEXT, PRIMARY KEY ('key'))`;

    this.db = this.connect()
      .then(db => this.query(createTable).then(() => db));
  }

  async connect(): Promise<sql3DB> {
    return new Promise<sql3DB>((resolve, reject) => {
      const db: sql3DB = new sql3DB(this.uri, err => {
        if (err) return reject(err);

        if (this.busyTimeout) db.configure(`busyTimeout`, this.busyTimeout);
        return resolve(db);
      });
    });
  }

  async query(sqlString: string): Promise<SqlQueryRow[]> {
    const db: sql3DB = await this.db;

    return new Promise<SqlQueryRow[]>((resolve, reject) => {
      db.all(sqlString, (err, rows: SqlQueryRow[]) => {
        if (err) return reject(err);

        resolve(rows);
      });
    });
  }

  namespaceKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | void> {
    const select = `SELECT value FROM ${
      this.table
    } WHERE key = '${this.namespaceKey(key)}'`;
    const [ row ] = await this.query(select);
    if (!row) return;

    const { expiry, value } = DatabaseHandler.deserialize(row);

    if (expiry < Date.now()) return;

    return value;
  }

  async set<V>(key: string, value: V, ttl: number = this.ttl): Promise<boolean> {
    const preparedData = DatabaseHandler.serialize<V>(value, ttl);

    const upsert = `INSERT INTO ${
      this.table
    } (key, value) VALUES ('${
      this.namespaceKey(key)
    }', '${
      preparedData.replace(/\\/g, `\\\\`)
    }')`;

    return this.query(upsert)
      .then(() => true)
      .catch(() => false);
  }

  async delete(key: string, brute = false): Promise<boolean> {
    const namespacedKey = this.namespaceKey(key);

    if (!brute) {
      const select = `SELECT key WHERE key = '${namespacedKey}'`;
      const [ row ] = await this.query(select);

      if (!row) return false;
    }

    const del = `DELETE FROM ${this.table} WHERE key = '${namespacedKey}'`;

    await this.query(del);
    return true;
  }

  async getAll<V = any>(): Promise<DataEntry<V>[]> {
    const selectAll = `SELECT * FROM ${
      this.table
    } WHERE key LIKE '${this.namespace}%'`;
    const rows = await this.query(selectAll);

    return rows
      .map(row => DatabaseHandler.deserialize(row))
      .filter(({ expiry, key }) => expiry > Date.now()
        || (this.delete(key, true) && false));
  }

  async deleteAll(confirmClear: boolean): Promise<boolean> {
    if (!confirmClear) return false;

    const del = `DELETE FROM ${this.table}`;

    await this.query(del);
    return true;
  }

  // Any -> Serialized Buffer -> Deflated Buffer -> Deflated Base64 String
  static serialize<V = any>(rawData: V, ttl: number = 0): string {
    const serializedData = serialize(rawData);

    const deflatedData = deflateRawSync(serializedData, {
      level: Z_BEST_COMPRESSION
    })
      .toString(`base64`);

    return `${(ttl && Date.now() + ttl).toString(36)}:${deflatedData}`;
  }

  // Deflated Base64 String -> Deflated Buffer -> Inflated Buffer -> Any
  static deserialize<V = any>(row: SqlQueryRow): DataEntry<V> {
    const { key, value } = row;

    // Value extraction
    const splitIndex = value.indexOf(`:`);
    const expiry = parseInt(value.slice(0, splitIndex), 36);

    const compressedData = value.slice(splitIndex + 1);

    const bufferedData = Buffer.from(compressedData, `base64`);
    const inflatedData = inflateRawSync(bufferedData);

    // Key extraction
    const keyIndex = key.indexOf(`:`) + 1;

    return {
      key: key.slice(keyIndex),
      value: deserialize(inflatedData),
      expiry
    };
  }

}




export class DatabaseCache<V> {

  readonly driver: DatabaseHandler;
  readonly cache: Map<string, DataPacket<V>> = new Map();

  constructor(driver: DatabaseHandler) {
    this.driver = driver;
  }

  async get(key: any): Promise<V | void> {
    if (!this.cache.has(key)) return this.driver.get<V>(key);

    const { value, expiry }: DataPacket<V> = this.cache.get(key)!;

    if (expiry > Date.now() || !expiry) return value;

    this.driver.delete(key, true) && this.cache.delete(key);
  }

  async set(key: string, value: V, expiry: number): Promise<boolean> {
    if (expiry < Date.now() && expiry !== 0) return false;

    this.cache.set(key, { value, expiry });

    return this.driver.set(key, value, expiry);
  }

  async delete(key: any, cacheOnly = false): Promise<boolean> {
    const databaseDelete = cacheOnly
      ? true
      : await this.driver.delete(key);

    if (!databaseDelete) return databaseDelete;

    return this.cache.delete(key);
  }

  async cacheAll() {
    const entries = await this.driver.getAll<V>();

    entries.map(({ key, ...packet }) => this.cache.set(key, packet));
  }
}