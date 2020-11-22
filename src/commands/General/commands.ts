import { Categories, CommandParameters, SprikeyCommand } from "@structs/SprikeyCommand";
import { FailureData } from "discord-akairo";
import { Collection, Message } from "discord.js";

export default class CommandsCommand extends SprikeyCommand {

  constructor() {
    super("commands", {
      description: "View category commands",
      parameters: new CommandParameters({
        usages: [ {
          title: "View all commands in a Category",
          parameters: [
            "[Category Name]"
          ]
        } ]
      })
    }, {
      args: [ {
        id: "category",
        type: "category",
        otherwise: (_: Message, failureData: FailureData) => this.embeds.error(
          failureData.phrase
            ? `A category by name "${failureData.phrase}" does not exsit!`
            : `You did not provide the name of the category you want to view the commands of!\n\nAvailable Categories:\n${Array.from(this.client.handlers.command.categories.keys()).join(", ")}`
        )
      } ]
    });
  }

  async exec({ channel }: Message, { category }: CommandsArg): Promise<void> {
    const categoryCommands = [ ...category.values() ]
      .map(({
        name,
        metadata: { icon, description }
      }: SprikeyCommand) => `${icon.emoji} \`$${name}\`: ${description}`)
      .join("\n");

    await channel.send(
      this.embeds.default(categoryCommands).setAuthor(`${category.id} Commands`)
    );
  }

}


interface CommandsArg {
  readonly categoryName: keyof typeof Categories;
  readonly category: Collection<string, SprikeyCommand> & { id: string };
}