import PingCommand from "@commands/General/ping";
import ExecCommand from "@commands/Master/exec";
import { SprikeyClient } from "@structs/SprikeyClient";
import { Categories, Command } from "@structs/typedefs/Command";
import { Collection } from "discord.js";

const commandClasses = {
  PingCommand: new PingCommand(),
  ExecCommand: new ExecCommand()
} as const;

export class CommandManager {

  readonly categories: Collection<Categories, this["commands"]> = new Collection(
    Object.keys(Categories).map(category => [
      Categories[category as CategoryKeys],
      new Collection()
    ])
  );

  readonly commands = new Collection<string, Command<object>>();

  constructor(readonly client: SprikeyClient) {
    for (const command of Object.values(commandClasses)) {
      this.commands.set(command.name, command);
    }
  }

}

type CategoryKeys = keyof typeof Categories;