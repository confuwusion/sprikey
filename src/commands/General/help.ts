import { ICONS } from "@constants/Icons";
import { AvailableCommands } from "@structs/managers/Command";
import { SprikeyClient } from "@structs/SprikeyClient";
import { Categories, Command, CommandArguments, ParseArg } from "@structs/typedefs/Command";
import { DMChannel, Message, MessageEmbed, TextChannel } from "discord.js";

const HELP_MENU_MESSAGE = `Hello there young lad! Looks like you're a bit lost, so lemme guide you around a little.

I have a few commands on me that will enhance your interaction with this server. You can view them by sending \`$commands [Category Name]\` to this chat, where you are supposed to replace \`[Category Name]\` entirely with one of the command categories you're interested in.

The available command categories are listed below.

Not sure how to use a command? Open up its help menu by using command \`$help [Command Name]\` where you are supposed to replace \`[Command Name]\` entirely by the name of your desired command.`;

export default class HelpCommand extends Command<HelpArg> {

  constructor() {
    super(`help`, {
      description: `View bot help`,
      category: Categories.General,
      icon: ICONS.HELP,
      args: new CommandArguments({
        blank: `to view Help Menu`,
        usages: [ {
          title: `View Command Help Menu`,
          parameters: [
            `[Command Name]`
          ]
        } ],
        detectors: [
          /^\w+/
        ]
      })
    });
  }

  async run(client: SprikeyClient, { channel }: Message, { selectedCommand }: HelpArg): Promise<void> {
    if (selectedCommand) return void await this.commandHelp(channel as TextChannel | DMChannel, selectedCommand);

    const categoryList = Array.from(client.managers.command.categories.keys())
      .map(category => `❯ ${category}`)
      .join(`\n`);
    const links = [
      `<:Discord:698472672509558784> [Communimate](https://discord.gg/mXcZDe9)`,
      `<:YouTube:698472732546826281> [Communimate ANIMATIONS](https://www.youtube.com/channel/UC5gbnjxaa68hwonvSpqH9dQ)`,
      `<:Twitter:698472800142360585> [Communimate (@the_rockho)](https://twitter.com/the_rockho?s=09)`
    ].join(`\n`);

    await channel.send(this.embeds.default(HELP_MENU_MESSAGE)
      .addFields([ {
        name: `Categories`,
        value: categoryList
      }, {
        name: `Links`,
        value: links
      } ]));
  }

  async commandHelp(channel: DMChannel | TextChannel, selectedCommand: AvailableCommands): Promise<void> {
    const {
      name,
      description,
      icon: {
        // eslint-disable-next-line camelcase
        url: icon_url
      },
      args: {
        blank,
        usages = []
      }
    } = selectedCommand;

    const uses = usages
      .map(({ title, description: desc, parameters = [] }) => {
        const commandUsage = `\`\`\`$${name} ${parameters.join(` `)}\`\`\``;
        return `▫️ **${title}**${desc ? `\n${desc}` : ``}${parameters.length ? `\n${commandUsage}` : ``}`;
      })
      .join(`\n`);

    void await channel.send(
      this.embeds.default(description)
        .setAuthor(`Help Menu | $${name}`, icon_url)
        .addFields([ {
          name: `Usage`,
          value: `${blank ? `*Leave blank to ${blank}*\n` : ``}${uses}`
        } ])
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async parse(
    { managers }: SprikeyClient,
    message: Message, [ [ rawCommandName ] ]: ParseArg
  ): Promise<HelpArg | MessageEmbed> {
    if (!rawCommandName) return {};

    const commandName = rawCommandName.toLowerCase();
    const selectedCommand = managers.command.commands.get(commandName);
    if (!selectedCommand) return this.embeds.error(`You have provided an invalid Command Name!`);

    return { selectedCommand };
  }

}


interface HelpArg {
  readonly selectedCommand?: AvailableCommands;
}