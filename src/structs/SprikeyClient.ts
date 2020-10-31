import { GUILD } from "@constants/Guild";
import { TableMetadata } from "@db/config";
import { InitiatedConnection } from "@db/connection";
import { generateBotCache } from "@db/lib/cache";
import { OptionsManager } from "@db/lib/managers/Options";
import { Client, Guild } from "discord.js";
import { EventEmitter } from "events";

import { CommandManager } from "./managers/Command";
import { ListenerManager } from "./managers/Listeners";
import { PermissionsManager } from "./managers/Permissions";

export class SprikeyClient extends Client {

  readonly botIdentity = process.env.BOT_IDENTITY as "test" | "main";

  readonly botOptions: OptionsManager;

  readonly cache = generateBotCache();

  readonly db: TableMetadata.Managers;

  readonly managers: ManagerInstances;

  readonly internalEvents = new EventEmitter();

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
      },
      fetchAllMembers: true
    });

    this.botOptions = connection.botOptions;
    this.db = connection.db;

    this.managers = {
      command: new CommandManager(this),
      listener: new ListenerManager(this),
      permission: new PermissionsManager(this)
    };

    this.once(`ready`, () => this.generateInternalEvents());

  }

  async fetchGuilds(): Promise<{ MAIN_GUILD: Guild | null; TEST_GUILD: Guild }> {
    return {
      MAIN_GUILD: this.botIdentity === `main` ? await this.guilds.fetch(GUILD.MAIN) : null,
      TEST_GUILD: await this.guilds.fetch(GUILD.TEST)
    };
  }

  get MAIN_GUILD(): Guild {
    return this.guilds.cache.get(GUILD.MAIN)!;
  }

  get TEST_GUILD(): Guild {
    return this.guilds.cache.get(GUILD.TEST)!;
  }

  private generateInternalEvents(): void {
    void this.fetchGuilds()
      .then(() => this.internalEvents.emit(`guildLoad`));
  }
}

interface ManagerInstances {
  command: CommandManager;
  listener: ListenerManager;
  permission: PermissionsManager;
}