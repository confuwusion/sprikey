import { ConfiguredConnections, ConnectionConfig, TableMetadata } from "@db/config";
import { OptionsManager } from "@db/lib/managers/Options";
import { DatabaseManager } from "@db/lib/managers/Relational";
import { createConnection } from "typeorm";

/**
 * Connects to the database and prepares repositories and their cache
 *
 * @returns - The connection, repositories and database managers
 */
export async function initiateConnection(): Promise<InitiatedConnection> {
  const connections = await createConnections();
  const repositories = getEntityRepositories(connections);
  const db = createDatabaseManagers(connections, repositories);
  const botOptions = new OptionsManager(connections, repositories.BotOptions);

  const loadedEntries = await loadAllEntries(db);
  await botOptions.loadAllEntries();

  return { botOptions, db, loadedEntries, repositories };
}

/**
 * @returns - Main and Cache connections
 */
async function createConnections(): Promise<ConfiguredConnections> {
  const [ mainConnection, cacheConnection ] = await Promise.all([
    createConnection(ConnectionConfig.main),
    createConnection(ConnectionConfig.cache)
  ]);

  return { main: mainConnection, cache: cacheConnection };
}

/**
 * Fetch repositories of registered Entities from the provided connection
 *
 * @param connection - The connection to fetch repositories from
 * @param connections
 * @returns - The repositories of the provided connection
 */
function getEntityRepositories(connections: ConfiguredConnections): TableMetadata.Repositories {
  const repoEntries = Object.entries(TableMetadata.classes)
    .map(([ entityName, EntityClass ]) => [
      entityName,
      {
        main: connections.main.getRepository(EntityClass),
        cache: connections.cache.getRepository(EntityClass)
      }
    ]);

  return Object.fromEntries(repoEntries) as TableMetadata.Repositories;
}

/**
 * @param connections
 * @param repositories
 *
 * @returns - Database Managers
 */
function createDatabaseManagers(
  connections: ConfiguredConnections,
  repositories: TableMetadata.Repositories
): TableMetadata.Managers {
  return {
    ActionData: new DatabaseManager(
      connections,
      repositories.ActionData
    ),
    PermissionData: new DatabaseManager(
      connections,
      repositories.PermissionData
    ),
    IFTTTWebhooks: new DatabaseManager(
      connections,
      repositories.IFTTTWebhooks
    ),
    LogChannels: new DatabaseManager(
      connections,
      repositories.LogChannels
    )
  } as const;
}

/**
 * @param db
 */
async function loadAllEntries(db: TableMetadata.Managers): Promise<TableMetadata.LoadedEntries> {
  const entityEntries = Object.entries(db)
    .map(async([ entry, manager ]) => [ entry, await manager.find() ]);

  return Object.fromEntries(await Promise.all(entityEntries)) as TableMetadata.LoadedEntries;
}


export interface InitiatedConnection {
  botOptions: OptionsManager;
  db: TableMetadata.Managers;
  loadedEntries: TableMetadata.LoadedEntries;
  repositories: TableMetadata.Repositories;
}

