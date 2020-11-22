import { SprikeyCommand } from "@structs/SprikeyCommand";
import SprikeyListener from "@structs/SprikeyListener";
import { Message } from "discord.js";

export default class CommandBlocked extends SprikeyListener {

  constructor() {
    super("commandBlocked", {
      emitter: "commandHandler",
      event: "commandBlocked"
    });
  }

  // eslint-disable-next-line class-methods-use-this
  exec(message: Message, command: SprikeyCommand, reason: string): void {
    console.log(`${message.author.tag} was blocked from using command ${command.id} because ${reason}`);
  }

}