import { CHANNELS } from "@constants/Channels";
import { ICONS } from "@constants/Icons";
import { PERMISSIONS } from "@constants/Permissions";
import { PermissionsManager } from "@structs/managers/Permissions";
import { SprikeyClient } from "@structs/SprikeyClient";
import { Command, CommandOptions } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { titleCase } from "string-fn";
import { Optional } from "utility-types";

export enum Categories {
  General,
  Fun,
  Utility,
  Moderation,
  Master,
  Watcher
}

const categoryHierarchies: CategoryHierarchies = {
  [Categories.General]: PERMISSIONS.HIERARCHIES.EVERYONE,
  [Categories.Fun]: PERMISSIONS.HIERARCHIES.EVERYONE,
  [Categories.Utility]: PERMISSIONS.HIERARCHIES.EVERYONE,
  [Categories.Moderation]: PERMISSIONS.HIERARCHIES.MOD,
  [Categories.Master]: PERMISSIONS.HIERARCHIES.MASTER,
  [Categories.Watcher]: PERMISSIONS.HIERARCHIES.MOD
};

/*
 * A member-executable instruction for the bot
 **/
export class SprikeyCommand extends Command implements CommandInterface {

  readonly client!: SprikeyClient;

  readonly name: CommandInterface["name"];

  readonly metadata: CommandInterface["metadata"];

  readonly options: CommandInterface["options"];

  readonly permissions: CommandInterface["permissions"];

  constructor(
    name: keyof typeof ICONS,
    metadata: Omit<SprikeyCommand["metadata"], "icon">,
    givenOptions: CommandOptions = {},
    permissions?: CommandInterface["permissions"]
  ) {
    const akairoOptions = {
      ...givenOptions,
      aliases: [ name ].concat((givenOptions.aliases ?? []) as (keyof typeof ICONS)[])
    };

    super(name, akairoOptions);

    this.name = name;
    this.permissions = new CommandPermissions(permissions);
    this.metadata = {
      ...metadata,
      icon: ICONS[name]
    };
    this.options = akairoOptions;

  }

  // @ts-ignore 2425
  async userPermissions({ author, channel }: Message): Promise<string | undefined> {
    const memberHierarchy = await this.client.managers.permission.forCommand(this.name, author.id);
    const { exclusive, channels } = this.permissions;

    const checkLog = this.client.cache.logs.permissionChecks.add({
      command: { name: this.name },
      member: { username: author.username, hierarchy: memberHierarchy },
      allowedInChannel: channels.includes(channel.id),
      exclusiveToChannel: exclusive
    });

    if (!channels.includes(channel.id)) {
      const isStaff = PermissionsManager.compare(
        PERMISSIONS.HIERARCHIES.MOD,
        PERMISSIONS.TRENDS.CURRENT_ABOVE,
        memberHierarchy
      );
      checkLog.member.isStaff = isStaff;

      if (channel.type !== "dm") {
        if (exclusive) return `Command does not belong to ${channel.name} channel!`;
        if (!isStaff) return "You can only use this command in bot channels!";
      }
    }

  }

  embedTemplate(): MessageEmbed {
    return new MessageEmbed()
      .setAuthor(titleCase(this.name), this.metadata.icon.url);
  }

  get embeds(): CommandEmbeds {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const command = this;

    return {
      default(message): MessageEmbed {
        return command.embedTemplate()
          .setDescription(message)
          .setColor(4691422);
      },
      error(errorMessage): MessageEmbed {
        return command.embedTemplate()
          .setDescription(`<:error:709510101760868435> ${errorMessage}`)
          .setColor(12864847);
      },
      warn(warnMessage): MessageEmbed {
        return command.embedTemplate()
          .setDescription(warnMessage)
          .setColor(16763981);
      },
      success(successMessage): MessageEmbed {
        return command.embedTemplate()
          .setDescription(`<:success:709510035960496149> ${successMessage}`)
          .setColor(4241788);
      }
    };
  }

}

export class CommandIcon implements CommandIconEntry {

  readonly emoji: CommandIconEntry["emoji"];

  readonly url: CommandIconEntry["url"];

  constructor(emoji: CommandIcon["emoji"], url: CommandIcon["url"]) {
    this.emoji = emoji;
    this.url = url;
  }

}

export class CommandParameters implements CommandParametersEntry {

  readonly blank: string;

  readonly usages: CommandUsageEntry[];

  constructor({
    usages = [],
    blank = ""
  }: Partial<Omit<CommandParameters, "usages">> & { readonly usages: Optional<CommandUsageEntry, "description">[] }) {
    this.blank = blank;
    this.usages = usages.map(usage => new CommandUsage(usage));
  }

}

class CommandUsage implements CommandUsageEntry {

  readonly title: CommandUsageEntry["title"];

  readonly parameters: CommandUsageEntry["parameters"];

  readonly description: CommandUsageEntry["description"];

  constructor({ title, parameters, description = "" }: Optional<CommandUsageEntry, "description">) {
    this.title = title;
    this.parameters = parameters;
    this.description = description;
  }

}

export class CommandPermissions implements CommandPermissionsEntry {

  readonly channels: CommandPermissionsEntry["channels"];

  readonly exclusive: CommandPermissionsEntry["exclusive"];

  readonly hierarchy: CommandPermissionsEntry["hierarchy"];

  readonly trend: CommandPermissionsEntry["trend"];

  constructor(
    {
      channels = CHANNELS.COMMAND,
      exclusive = false,
      hierarchy,
      trend = PERMISSIONS.TRENDS.CURRENT_ABOVE
    }: Partial<CommandPermissionsEntry> = {},
    category?: Categories
  ) {
    this.exclusive = exclusive;
    this.channels = channels;
    this.hierarchy = hierarchy ?? (category ? categoryHierarchies[category] : PERMISSIONS.HIERARCHIES.EVERYONE);
    this.trend = trend;
  }

}

type CategoryHierarchies = {
  [key in Categories]: PERMISSIONS.HIERARCHIES;
};

interface CommandIconEntry {

  /**
   * The unicode emoji that represents the icon
   **/
  readonly emoji: string;

  /**
   * The twemoji URL that represents the icon
   **/
  readonly url: string;

}

interface CommandParametersEntry {

  /**
   * Describes what the command does if no arguments were provided by the member
   **/
  readonly blank: string;

  /**
   * List of various usage instructions
   **/
  readonly usages: CommandUsageEntry[];

}

interface CommandUsageEntry {

  /**
   * A title that identifies the usage
   *
   * @example
   *   ```typescript
   *     title: "Set a reminder"
   *   ```
   **/
  readonly title: string;

  /**
   * The parameter structure of this usage
   *
   * @example
   * ```typescript
   *   parameters: [
   *     // Required fixed parameter
   *     // Fixed parameters (usually near the beginning) represent a distinct usage
   *     // They separate major features of the command
   *     `set`,
   *     `[Time]`,
   *      // Optional dynamic parameter
   *      // The command shouldn't give an error if argument to this parameter isn't provided
   *     `[Channel?]`
   *     `[Description?]`
   *   ]
   * ```
   **/
  readonly parameters: string[];

  /**
   * An explalation on what the provided usage does
   */
  readonly description: string;

}

interface CommandPermissionsEntry {

  /**
   * Restrict the usage of this command to the selected channels
   * Defaults to false
   **/
  readonly exclusive: boolean;

  /**
   * IF exclusive is false:
   *   Channels any general user can use the command in
   * IF exclusive is true:
   *   Channels the command is meant to be used in
   **/
  readonly channels: string[];

  /**
   * The hierarchy required for usage of this command
   * Defaults to the hierarchy provided by the category
   **/
  readonly hierarchy: PERMISSIONS.HIERARCHIES;

  /**
   * Selection of hierarchies from the selected hierarchy
   * Defaults to PERMISSIONS.TRENDS.CURRENT_ABOVE
   **/
  readonly trend: PERMISSIONS.TRENDS;

}

interface CommandInterface {

  /**
   * Name of the command
   */
  readonly name: string;

  /**
   * Descriptive data of the command
   */
  readonly metadata: CommandMetadata;

  /**
   * Options for AkairoCommand
   */
  readonly options: CommandOptions;

  /**
   * Command usability by members in channels
   **/
  readonly permissions: CommandPermissionsEntry;

}

interface CommandMetadata {

  /**
   * Describes what the command does
   **/
  readonly description: string;

  /**
   * The icon that graphically identifies the command
   **/
  readonly icon: CommandIconEntry;

  /**
   * Details of the command parameters
   */
  readonly parameters: CommandParametersEntry;

}

export interface PermissionCheck {
  command: {
    name: string;
  };
  member: {
    username: string;
    hierarchy: number;
    isStaff?: boolean;
  };
  allowedInChannel: boolean;
  exclusiveToChannel: boolean;
}

type CommandEmbeds = {
  readonly [K in "default" | "error" | "warn" | "success"]: (message: string) => MessageEmbed;
};