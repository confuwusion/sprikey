import { CHANNELS } from "@constants/Channels";
import { PERMISSIONS } from "@constants/Permissions";
import { PermissionsManager } from "@structs/managers/Permissions";
import { SprikeyClient } from "@structs/SprikeyClient";
import { Message, MessageEmbed } from "discord.js";
import { titleCase } from "string-fn";
import { Optional } from "utility-types";

const INPUT_PLACEHOLDER = `{input}`;
const INPUT_PATTERN = new RegExp(INPUT_PLACEHOLDER.replace(/(\{|\})/g, (_, brace: string) => `\\${brace}`), `gi`);

export enum Categories {
  General,
  Fun,
  Utility,
  Moderation,
  Master,
  Watcher
}

type CategoryHierarchies = {
  [key in Categories]: PERMISSIONS.HIERARCHIES;
};

const categoryHierarchies: CategoryHierarchies = {
  [Categories.General]: PERMISSIONS.HIERARCHIES.EVERYONE,
  [Categories.Fun]: PERMISSIONS.HIERARCHIES.EVERYONE,
  [Categories.Utility]: PERMISSIONS.HIERARCHIES.EVERYONE,
  [Categories.Moderation]: PERMISSIONS.HIERARCHIES.MOD,
  [Categories.Master]: PERMISSIONS.HIERARCHIES.MASTER,
  [Categories.Watcher]: PERMISSIONS.HIERARCHIES.MOD
};

// eslint-disable-next-line jsdoc/require-returns-check
// eslint-disable-next-line jsdoc/require-jsdoc
function checkFaultyArgs(name: string, { blank, usages, detectors }: CommandArguments): never | void {
  if (!(blank.length || usages.length)) {
    throw new Error(`COMMAND ERROR: (${name}): Command Usage details are not defined!`);
  }
  if (!usages.length !== !detectors.length) {
    throw new Error(`COMMAND ERROR: (${name}): Parameters do not correspond with Command Usage!`);
  }
}

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

export class CommandIcon implements CommandIconEntry {

  readonly emoji: CommandIconEntry["emoji"];

  readonly url: CommandIconEntry["url"];

  constructor(emoji: CommandIcon["emoji"], url: CommandIcon["url"]) {
    this.emoji = emoji;
    this.url = url;
  }

}

interface CommandArgumentsEntry {

  /**
   * Describes what the command does if no arguments were provided by the member
   **/
  readonly blank: string;

  /**
   * a
   **/
  readonly details: string;

  /**
   * List of regex that represent and break down each parameter.
   * Each array entry represents an individual parameter (in order).
   **/
  readonly detectors: RegExp[];

  /**
   * Hardcoding parameters that can dynamically accept user input.
   * Each array entry represents an individual parameter (in order).
   * Place {[inp]} anywhere inside individual parameter strings to accept user input in that place, for that parameter.
   **/
  readonly fillers: string[];

  /**
   * List of various usage instructions
   **/
  readonly usages: CommandUsage[];
}

class CommandArguments implements CommandArgumentsEntry {

  readonly blank: string;

  readonly details: string;

  readonly detectors: RegExp[];

  readonly fillers: string[];

  readonly usages: CommandUsage[];

  constructor({
    usages,
    blank = ``,
    details = ``,
    detectors = [],
    fillers = []
  }: CommandArguments) {
    this.blank = blank;
    this.details = details;
    this.detectors = detectors;
    this.fillers = fillers;
    this.usages = usages.map(usage => new CommandUsage(usage));
  }

}

class CommandUsageEntry {
  /**
   * A title that describes the usage
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
   *      // Optional dynamic parameter.
   *      // The {@link:Command.parse} method should set a default if necessary
   *      // The command shouldn't give an error if argument to this parameter isn't provided
   *     `[Channel?]`
   *     `[Description?]`
   *   ]
   * ```
   **/
  readonly parameters: string[];
}

class CommandUsage implements CommandUsageEntry {

  readonly title: string;

  readonly parameters: string[];

  constructor({ title, parameters }: CommandUsage) {
    this.title = title;
    this.parameters = parameters;
  }
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
    }: Optional<CommandPermissionsEntry, "hierarchy">,
    category?: Categories
  ) {
    this.exclusive = exclusive;
    this.channels = channels;
    this.hierarchy = hierarchy ?? (category ? categoryHierarchies[category] : PERMISSIONS.HIERARCHIES.EVERYONE);
    this.trend = trend;
  }
}

interface CommandInterface {

  /**
   * Describes what the command does
   **/
  readonly description: string;

  /**
   * Category the command belongs to
   **/
  readonly category: Categories;

  /**
   * The icon that graphically identifies the command
   **/
  readonly icon: CommandIconEntry;

  /**
   * Parameter definitions of the command
   * Provide at least either {@link CommandArguments.blank} or {@link CommandArguments.detectors} with {@link CommandArguments.usage}
   **/
  readonly args: CommandArgumentsEntry;

  /**
   * Command usability by members in channels
   **/
  readonly permissions: CommandPermissionsEntry;

  /**
   * Conversion and validation of member arguments
   **/
  readonly parse: (client: SprikeyClient, pieces: string[]) => object;

  /**
   * Performing the main functionality of the command
   * Note: It doesn't have to be in a single function. You can link multiple functions by calling them in this function
   **/
  readonly run: (
    client: SprikeyClient,
    parsedArgs: ReturnType<Command["parse"]>
  ) => Promise<Promise<unknown>[]>;
}

/*
 * A member-executable instructions for the bot
 **/
export class Command implements CommandInterface {

  readonly description: CommandInterface["description"];

  readonly category: CommandInterface["category"];

  readonly icon: CommandInterface["icon"];

  readonly args: CommandInterface["args"];

  readonly permissions: CommandInterface["permissions"];

  readonly parse: CommandInterface["parse"];

  readonly run: CommandInterface["run"];

  constructor(
    readonly name: string,
    { description, category, run, parse, icon, args, permissions }: CommandInterface,
    readonly inherits?: Command
  ) {

    checkFaultyArgs(name, args);

    this.description = description;
    this.category = category;
    this.icon = icon;
    this.args = args;
    this.permissions = permissions;
    this.run = run;
    this.parse = parse;
  }

  async hasPermission(client: SprikeyClient, { author, channel }: Message): Promise<boolean> {
    const memberPermissions = client.managers.permissions;
    const memberHierarchy = await memberPermissions.forCommand(this.name, author.id);
    const { exclusive, channels, hierarchy, trend } = this.permissions;

    const checkLog = client.cache.logs.permissionChecks.add({
      command: { name: this.name, hierarchy, trend },
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

      // Do not allow if command is not exclusive to channels or if member is not staff
      if ((exclusive || !isStaff) && channel.type !== `dm`) return false;
    }

    return PermissionsManager.compare(hierarchy, trend, memberHierarchy);
  }

  createSub(
    name: Command["name"],
    subPermissions: Command["permissions"],
    fillers: Command["args"]["fillers"]
  ): Command {
    const { args, permissions, ...otherDetails } = this;

    const subbedCommand = new Command(name, {
      ...otherDetails,
      args: { ...args, fillers },
      permissions: { ...permissions, ...subPermissions }
    }, this);

    return subbedCommand;
  }

  embedTemplate(): MessageEmbed {
    return new MessageEmbed()
      .setAuthor(titleCase(this.name), this.icon.url);
  }

  extractArgs(content: string): readonly (string | readonly string[])[] {
    const {
      args: { detectors, fillers = [] }
    } = this;

    if (!detectors.length) return [];

    let remaining = content;

    return detectors.map((detector, i) => {
      const filler = fillers[i] || INPUT_PLACEHOLDER;
      const captureRegex = detector.global
        ? new RegExp(`^((?:(?:${detector.source})\\s*)+)`)
        : detector;

      const userCapture = (captureRegex.exec(remaining) || ``)[0].replace(/\$&/g, `\\$\\&`);
      const completeArg = filler.replace(INPUT_PATTERN, userCapture).trim();
      const wholeCapture = detector.exec(completeArg) || ``;

      remaining = remaining.slice(userCapture.length).trim();

      return wholeCapture && !detector.global
        ? wholeCapture[0]
        : wholeCapture;
    });
  }
}

export interface PermissionCheck {
  command: {
    name: string;
    hierarchy: number;
    trend: number;
  };
  member: {
    username: string;
    hierarchy: number;
    isStaff?: boolean;
  };
  allowedInChannel: boolean;
  exclusiveToChannel: boolean;
}