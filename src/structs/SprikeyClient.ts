import { GUILD } from "@constants/Guild";
import { MASTER_ID } from "@constants/Team";
import { TableMetadata } from "@db/config";
import { InitiatedConnection } from "@db/connection";
import { generateBotCache } from "@db/lib/cache";
import { OptionsManager } from "@db/lib/managers/Options";
import { AppState } from "app";
import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from "discord-akairo";
import { Guild } from "discord.js";
import { EventEmitter } from "events";
import * as path from "path";

import SprikeyCommandHandler from "./handlers/SprikeyCommandHandler";
import { PermissionsManager } from "./managers/Permissions";

export class SprikeyClient extends AkairoClient {

  readonly botIdentity = process.env.BOT_IDENTITY as "test" | "main";

  readonly botOptions: OptionsManager;

  readonly cache = generateBotCache();

  readonly db: TableMetadata.Managers;

  readonly handlers: HandlerInstances;

  readonly managers: ManagerInstances;

  readonly internalEvents = new EventEmitter();

  constructor(readonly connection: InitiatedConnection, readonly appState: AppState) {

    super({ ownerID: MASTER_ID }, {
      partials: [
        "MESSAGE",
        "REACTION",
        "GUILD_MEMBER",
        "USER"
      ],
      presence: {
        status: "idle",
        activity: {
          name: "Initiating bot..."
        }
      },
      fetchAllMembers: true,
      disableMentions: "everyone"
    });

    this.botOptions = connection.botOptions;
    this.db = connection.db;

    this.managers = {
      permission: new PermissionsManager(this)
    };

    this.handlers = {
      command: new SprikeyCommandHandler(this),
      inhibitor: new InhibitorHandler(this, { directory: path.join(__dirname, "../inhibitors/") }),
      listener: new ListenerHandler(this, { directory: path.join(__dirname, "../listeners/") })
    };

    this.once("ready", () => this.generateInternalEvents());

  }

  async fetchGuilds(): Promise<{ MAIN_GUILD: Guild | null; TEST_GUILD: Guild }> {
    return {
      MAIN_GUILD: this.botIdentity === "main" ? await this.guilds.fetch(GUILD.MAIN) : null,
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
      .then(() => this.internalEvents.emit("guildLoad"));
  }
}

interface ManagerInstances {
  readonly permission: PermissionsManager;
}

interface HandlerInstances {
  readonly command: CommandHandler;
  readonly inhibitor: InhibitorHandler;
  readonly listener: ListenerHandler;
}