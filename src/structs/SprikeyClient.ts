import { GUILD } from "@constants/Guild";
import { TableMetadata } from "@db/config";
import { InitiatedConnection } from "@db/connection";
import { generateBotCache } from "@db/lib/cache";
import { OptionsManager } from "@db/lib/managers/Options";
import { Client, Collection, Guild } from "discord.js";

import { PermissionsManager } from "./managers/Permissions";
import { Categories, Command } from "./typedefs/Command";

export class SprikeyClient extends Client {

  readonly botOptions: OptionsManager;

  readonly cache = generateBotCache();

  readonly categories: Collection<Categories, this["commands"]> = new Collection(
    Object.keys(Categories).map(category => [
      Categories[category as CategoryKeys],
      new Collection()
    ])
  );

  readonly commands: Collection<string, Command> = new Collection();

  readonly db: TableMetadata.Managers;

  readonly managers: ManagerInstances;

  eventState = false;

  constructor(readonly connection: InitiatedConnection) {

    super({
      partials: [
        `MESSAGE`,
        `REACTION`,
        `GUILD_MEMBER`,
        `USER`
      ],
      presence: {
        status: `idle`,
        activity: {
          name: `Initiating bot...`
        }
      }
    });

    this.botOptions = connection.botOptions;
    this.db = connection.db;

    this.managers = {
      permissions: new PermissionsManager(this)
    };
  }

  get MAIN_GUILD(): Guild {
    return this.guilds.cache.get(GUILD.MAIN)!;
  }

  get TEST_GUILD(): Guild {
    return this.guilds.cache.get(GUILD.TEST)!;
  }
}

interface ManagerInstances {
  permissions: PermissionsManager;
}

type CategoryKeys = keyof typeof Categories;