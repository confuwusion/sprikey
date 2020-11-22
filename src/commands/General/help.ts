import { EMOTES } from "@constants/Icons";
import { CommandParameters, SprikeyCommand } from "@structs/SprikeyCommand";
import { Argument, FailureData } from "discord-akairo";
import { DMChannel, Message, MessageEmbed, TextChannel } from "discord.js";

const HELP_MENU_MESSAGE = `Hello there young lad! Looks like you're a bit lost, so lemme guide you around a little.

I have a few commands on me that will enhance your interaction with this server. You can view them by sending \`$commands [Category Name]\` to this chat, where you are supposed to replace \`[Category Name]\` entirely with one of the command categories you're interested in.

The available command categories are listed below.

Not sure how to use a command? Open up its help menu by using command \`$help [Command Name]\` where you are supposed to replace \`[Command Name]\` entirely by the name of your desired command.`;

export default class HelpCommand extends SprikeyCommand {

  constructor() {
    super("help", {
      description: "View bot help",
      parameters: new CommandParameters({
        blank: "to view Help Menu",
        usages: [ {
          title: "View Command Help Menu",
          parameters: [
            "[Command Name]"
          ]
        } ]
      })
    }, {
      args: [ {
        id: "selectedCommand",
        type: Argument.composeWithFailure(Argument.withInput("command"), "optional"),
        otherwise: (_: Message, failureData: FailureData): MessageEmbed => {
          return this.embeds.error(`A command by name "${failureData.phrase}" does not exist!`);
        }
      } ]
    });
  }

  async exec({ channel }: Message, { selectedCommand }: HelpArg): Promise<void> {
    if (selectedCommand) return void await this.commandHelp(channel as TextChannel | DMChannel, selectedCommand);

    const categoryList = Array.from(this.client.handlers.command.categories.keys())
      .map(category => `❯ ${category}`)
      .join("\n");
    const links = [
      `${EMOTES.Discord} [Communimate](https://discord.gg/mXcZDe9)`,
      `${EMOTES.YouTube} [Communimate ANIMATIONS](https://www.youtube.com/channel/UC5gbnjxaa68hwonvSpqH9dQ)`,
      `${EMOTES.Twitter} [Communimate (@the_rockho)](https://twitter.com/the_rockho?s=09)`
    ].join("\n");

    await channel.send(this.embeds.default(HELP_MENU_MESSAGE)
      .addFields([ {
        name: "Categories",
        value: categoryList
      }, {
        name: "Links",
        value: links
      } ]));
  }

  async commandHelp(channel: DMChannel | TextChannel, selectedCommand: SprikeyCommand): Promise<void> {
    const {
      name,
      metadata: {
        description,
        icon: { url: iconURL },
        parameters: { blank, usages }
      }
    } = selectedCommand;

    const uses = usages
      .map(({ title, description: desc, parameters = [] }) => {
        const commandUsage = `\`\`\`$${name} ${parameters.join(" ")}\`\`\``;
        return `▫️ **${title}**${[ desc, parameters.length && commandUsage ].filter(Boolean).join("\n")}`;
      })
      .join("\n");

    void await channel.send(
      this.embeds.default(description)
        .setAuthor(`Help Menu | $${name}`, iconURL)
        .addFields([ {
          name: "Usage",
          value: `${blank ? `*Leave blank to ${blank}*\n` : ""}${uses}`
        } ])
    );
  }

}


interface HelpArg {
  readonly selectedCommand?: SprikeyCommand;
}