import * as CONSTANTS from "../../constants";
import * as Str from "string";
import { MessageEmbed } from "discord.js";

const {
  DENY,
  commandChannels,
  PERMISSIONS: {
    HIERARCHIES: { MASTER, MOD, EVERYONE },
    TRENDS: { CURRENT_ABOVE }
  }
} = CONSTANTS;

const INPUT_CAPTURE = /\{\[inp\]\}/g;

enum Categories {
  General,
  Fun,
  Utility,
  Moderation,
  Master,
  Watcher
}

const categoryHierarchies: { [key in Categories]: number } = {
  [Categories.General]: EVERYONE,
  [Categories.Fun]: EVERYONE,
  [Categories.Utility]: EVERYONE,
  [Categories.Moderation]: MOD,
  [Categories.Master]: MASTER,
  [Categories.Watcher]: MOD
};

function commandError(name: string, err: string) {
  return new Error(`Command Error (${name}): ${err}!`);
}

export interface CommandStructure {
  name: string,
  description: string
  category: Categories,
  icon: { emoji: string, url: string },
  args: {
    blank: string,
    details: string,
    fillers: string[],
    usage: any[],
    detectors: RegExp[]
  },
  permission: {
    exclusive: boolean,
    channels: string[],
    hierarchy: number,
    trend: number
  }
  parse(pack: any, pieces: string[]): object;
  run(pack: any, parsedArgs: object): Promise<Promise<any>[]>;
}

export class Command implements CommandStructure {

  readonly name: CommandStructure["name"];
  readonly description: CommandStructure["description"];
  readonly category: CommandStructure["category"];
  readonly icon: CommandStructure["icon"];
  readonly args: CommandStructure["args"];
  readonly permission: CommandStructure["permission"];

  readonly run: CommandStructure["run"];
  readonly parse: CommandStructure["parse"] = function(_p, _i): string[] {
    return _i;
  };

  constructor({
    name, description, category, run, parse, icon,
    args: {
      blank = ``,
      details = ``,
      fillers = [],
      usage = [],
      detectors = []
    },
    permission: {
      exclusive = false,
      channels = commandChannels,
      hierarchy = categoryHierarchies[category],
      trend = CURRENT_ABOVE
    }
  }: CommandStructure) {

    if (!(blank.length || usage.length)) {
      throw commandError(name, `Command Usage details are not defined`);
    }
    if (!usage.length !== !detectors.length) {
      throw commandError(name, `Parameters do not correspond with Command Usage`);
    }

    this.name = name;
    this.description = description;
    this.category = category;
    this.icon = icon;
    this.args = { blank, details, detectors, fillers, usage };
    this.permission = { exclusive, channels, hierarchy, trend };
    this.run = run;
    this.parse = parse;
  }

  hasPermission({ cache, channel, author }) {
    const { memberPermissions } = cache;

    const { exclusive, channels, hierarchy, trend } = this.permission;

    const memberHierarchy = memberPermissions.forCommand(this.name, author.id);
    console.log(`▫️Command:`, this.name);
    console.log(`Member:`, author.username);
    console.log(`Member Hierarchy:`, memberHierarchy);
    console.log(`Belongs to channel:`, channels.includes(channel.id));
    console.log(`Exclusive to channel:`, exclusive);

    // Command's usability in message channel
    if (!channels.includes(channel.id)) {
      const isStaff = memberPermissions.compare(MOD, CURRENT_ABOVE, memberHierarchy);
      console.log(`Is staff:`, isStaff);

      // Do not allow if command is not exclusive to channels or if member is not staff
      if ((exclusive || !isStaff) && channel.guild) return DENY;
    }

    // Member Command usability
    const commandUsable = memberPermissions.compare(hierarchy, trend, memberHierarchy);
    console.log(`Command Hierarchy and Trend:`, hierarchy, trend);
    console.log(`Command is usable:`, commandUsable);
    return commandUsable;
  }

  createSub(
    name: CommandStructure["name"],
    permissions: CommandStructure["permission"],
    fillers: CommandStructure["args"]["fillers"]
  ) {
    return new Subcommand(name, this, permissions, fillers);
  }

  embedTemplate() {
    return new MessageEmbed()
      .setAuthor(Str(this.name).capitalize().s, this.icon.url);
  }

  extractArgs(content: string) {
    const {
      args: { detectors, fillers = [] }
    } = this;

    if (!detectors.length) return detectors;

    let remaining = content;

    return detectors.map((detector, i) => {
      // Filler is a potentially pre-prepared
      // argument string for a command parameter
      // that might accept user input at
      // specified parts - wherever {[inp]} is
      // found

      // If filler doesn't contain user input tag,
      // it means it is not accepting user input
      // for that parameter

      // There can only be one set of input
      // per filler
      const filler = fillers[i] || `{[inp]}`;

      // Global regex is first given the non-global
      // behaviour (to extract text linearly) and
      // then use the global regex on the
      // non-globally extracted text

      // This logic is used to:
      // - Prevent global regex from extracting
      //   text from elsewhere
      // - Identify the true capture length so that
      //   the captured part can be cut out properly

      // Making global regex linear
      const captureRegex = detector.global
        ? new RegExp(`^((?:(?:${detector.source})\\s*)+)`)
        : detector;


      // Capture user input and place it on every
      // user input tag to complete the argument
      const userCapture = (remaining.match(captureRegex) || [ `` ])[0].replace(/\$&/g, `\\$\\&`);
      const completeArg = filler.replace(INPUT_CAPTURE, userCapture).trim();

      // Use the original regex on the completed
      // argument to produce expected behaviour,
      // thus expected output
      const wholeCapture = completeArg.match(detector) || [ `` ];

      // Take out the captured part from user input
      // If nothing was captured, then this will
      // slice to return the same string
      remaining = remaining.slice(userCapture.length).trim();
      return wholeCapture && !detector.global
        ? wholeCapture[0]
        : wholeCapture;
    });
  }
}

export class Subcommand extends Command {

  readonly inherits: Command;

  constructor(
    name: CommandStructure["name"],
    inherits: Command,
    { hierarchy, trend, exclusive, channels }: CommandStructure["permission"],
    fillers: CommandStructure["args"]["fillers"]
  ) {
    super({
      ...inherits,
      name,
      permission: {
        ...inherits.permission,
        hierarchy, trend, exclusive,
        channels: channels.length ? channels : inherits.permission.channels
      },
      args: {
        ...inherits.args,
        fillers
      }
    });

    this.inherits = inherits;
  }
}
