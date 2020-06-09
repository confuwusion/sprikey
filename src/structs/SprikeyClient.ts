import { Client, Collection, Guild } from "discord.js";
import { ActionsManager } from "./ActionsManager";
import { TimeManager } from "./TimeManager.js";

export class SprikeyClient extends Client {

  readonly client: Client;

  readonly MAIN_GUILD: Guild | void;
  readonly TEST_GUILD: Guild;

  readonly categories: Collection;
  readonly commands: Collection;

  eventState: boolean = false;

  constructor(cache, MAIN_GUILD: Guild | void, TEST_GUILD: Guild) {
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

    this.cache = cache;
    this.client = this;

    this.MAIN_GUILD = MAIN_GUILD;
    this.TEST_GUILD = TEST_GUILD;

    this.categories = new Collection();
    this.commands = new Collection();

    this.managers = {
      actions: new ActionsManager(this),
      censor: cache.wordCensor,
      permissions: cache.memberPermissions,
      time: new TimeManager(this, {}),
      watcher: cache.wordPatterns
    };
  }
}
