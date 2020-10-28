import { DatabaseManager } from "@db/lib/managers/Relational";
import { ActionData } from "@entities/ActionData";
import { BotOption } from "@entities/BotOptions";
import { CommandHierarchy } from "@entities/CommandHierarchies";
import { IFTTTWebhook } from "@entities/IFTTTWebhooks";
import { LogChannel } from "@entities/LogChannels";
import { join } from "path";
import { Connection, ConnectionOptions, Repository } from "typeorm";

const DATA_FOLDER = join(__dirname, `../../data`);
const MAIN_DATABASE_FILENAME = `main`;
const DRIVER_NAME = `sqlite3`;

const MODE = process.env.MODE as (keyof typeof dbPaths | undefined) ?? `development`;

const dbPaths = {
  test: `:memory:` as string,
  development: generateDBPath(`dev`),
  production: generateDBPath(`main`)
} as const;

const entities = {
  ActionData,
  BotOptions: BotOption,
  CommandHierarchies: CommandHierarchy,
  IFTTTWebhooks: IFTTTWebhook,
  LogChannels: LogChannel
} as const;

const entityClasses = Object.fromEntries(
  Object.entries(entities)
    .map(([ entityGroup, groupEntity ]) => [
      entityGroup as keyof typeof entities,
      groupEntity.Entity
    ])
) as EntityClasses;

const baseConnctionConfig: Partial<ConnectionOptions> = {
  type: `sqlite`,
  cache: { duration: 0 },
  entities: Object.values(entityClasses)
    .map(enityConfig => enityConfig),
  synchronize: true,
  logging: false,
  migrations: [ `src/migration/**/*.ts` ],
  subscribers: [ `src/subscriber/**/*.ts` ],
  cli: {
    entitiesDir: ``,
    migrationsDir: `src/migration`,
    subscribersDir: `src/subscriber`
  }
};

export namespace ConnectionConfig {

  export const main = {
    name: `main`,
    database: dbPaths[MODE],
    ...baseConnctionConfig
  } as ConnectionOptions;

  export const cache = {
    name: `cache`,
    database: `:memory:`,
    ...baseConnctionConfig
  } as ConnectionOptions;

}

/**
 * @param state
 *
 * @returns - Database path for selected state
 */
function generateDBPath(state: string): string {
  return `${DATA_FOLDER}/${state}/${DRIVER_NAME}-${MAIN_DATABASE_FILENAME}.sql`;
}

type EntityClasses = {
  [ entity in keyof typeof entities ]: (typeof entities[entity])["Entity"];
};

export namespace TableMetadata {

  export const classes = entityClasses;

  export type InstanceOfEntity<EntityTable extends keyof EntityClasses> = InstanceType<EntityClasses[EntityTable]>;

  export type Type = {
    [ EntityTable in keyof typeof entities ]: InstanceType<(typeof entities)[EntityTable]>;
  };


  export type Managers = {
    [ EntityTable in keyof Omit<EntityClasses, "BotOptions"> ]: DatabaseManager<InstanceOfEntity<EntityTable>>;
  };

  export type Repositories = {
    [ EntityTable in keyof EntityClasses ]: EntityRepository<EntityTable>;
  };

  export interface EntityRepository<EntityGroup extends keyof EntityClasses> {
    cache: Repository<InstanceOfEntity<EntityGroup>>;
    main: Repository<InstanceOfEntity<EntityGroup>>;
  }

  export type LoadedEntries = {
    [EntityTable in keyof Type]: InstanceOfEntity<EntityTable>[];
  };

}

export interface ConfiguredConnections {
  readonly main: Connection;
  readonly cache: Connection;
}
