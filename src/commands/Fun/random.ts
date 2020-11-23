import { CommandParameters, SprikeyCommand } from "@structs/SprikeyCommand";
import { randomElement } from "@util/randomizers";
import { Argument } from "discord-akairo";
import { Message } from "discord.js";

export default class RandomCommand extends SprikeyCommand {

  constructor() {
    super("random", {
      description: "Select a random item from a comma-separated list!",
      parameters: new CommandParameters({
        usages: [ {
          title: "Select from a comma separated list",
          parameters: [
            "[List]"
          ]
        } ]
      })
    }, {
      args: [ {
        id: "givenItems",
        type: Argument.compose(/(?:[^,] ?)+/gu, (_, input) => (input as unknown as { match?: string[] }).match),
        match: "content"
      } ]
    });
  }

  async exec({ channel }: Message, { givenItems }: RandomArg) {
    const selectedItem = randomElement(givenItems);

    const outputMessages = [
      `**${selectedItem}**, I choose you!`,
      `**${selectedItem}** caught my eye!`,
      `**${selectedItem}** doesn't do well in a hide and seek game...`,
      `PPPFFFSSSSHHH! It's **${selectedItem}**. You couldn't select that?`,
      `**${selectedItem}**. Take it or leave it.`,
      `**${selectedItem}**. Easy pick.`,
      `**${selectedItem}** makes my legs tickle...`,
      `It's **${selectedItem}** time!`
    ];

    return channel.send(this.embeds.default(randomElement(outputMessages)));
  }

}

interface RandomArg {
  readonly givenItems: string[];
}