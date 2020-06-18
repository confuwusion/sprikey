import { DatabaseCache } from "./DatabaseHandler";

export type StaticSchemaType<T> = DatabaseCache<keyof T, T[keyof T]>;
export type MappedSchemaType<K, V> = DatabaseCache<K, V>;
