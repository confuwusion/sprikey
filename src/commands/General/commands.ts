/* eslint-disable @typescript-eslint/require-await */
import { ICONS } from "@constants/Icons";
import { AvailableCommands } from "@structs/managers/Command";
import { SprikeyClient } from "@structs/SprikeyClient";
import { Categories, Command, CommandArguments, ParseArg } from "@structs/typedefs/Command";
import { Collection, Message, MessageEmbed } from "discord.js";

export class CommandsCommand extends Command <CommandsArg> {

  constructor() {
    super(`commands`, {
      description: `View category commands`,
      category: Categories.General,
      icon: ICONS.COMMANDS,
      args: new CommandArguments({
        usages: [ {
          title: `View all commands in a Category`,
          parameters: [
            `[Category Name]`
          ]
        } ],
        detectors: [
          /^\w+/
        ]
      })
    });
  }

  async run(client: SprikeyClient, { channel }: Message, { categoryName, category }: CommandsArg): Promise<void> {
    const categoryCommands = Object.values([ ...category.values() ])
      .map(({ name, icon: { emoji }, description }: AvailableCommands) => `${emoji} \`$${name}\`: ${description}`)
      .join(`\n`);

    await channel.send(
      this.embeds.default(categoryCommands).setAuthor(`${categoryName} Commands`)
    );
  }

  async parse(
    { managers }: SprikeyClient,
    message: Message,
    [ [ rawCategoryName ] ]: ParseArg
  ): Promise<CommandsArg | MessageEmbed> {
    if (!rawCategoryName) return this.embeds.error(`You need to provide the name of the category to view its commands!`);

    const categoryName = `${rawCategoryName[0].toUpperCase()}${rawCategoryName.slice(1).toLowerCase()}`;
    if (!CommandsCommand.isCategory(categoryName)) return this.embeds.error(`A category by name **${categoryName}** does not exist!`);

    const category = managers.command.categories.get(categoryName);
    if (!category) return this.embeds.error(`A category by name **${categoryName}** does not exist!`);

    return { categoryName, category };
  }

  static isCategory(categoryName: string): categoryName is keyof typeof Categories {
    return Object.keys(Categories).includes(categoryName);
  }

}


interface CommandsArg {
  readonly categoryName: keyof typeof Categories;
  readonly category: Collection<string, AvailableCommands>;
}