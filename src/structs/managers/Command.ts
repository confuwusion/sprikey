import { CommandsCommand } from "@commands/General/commands";
import HelpCommand from "@commands/General/help";
import PingCommand from "@commands/General/ping";
import ExecCommand from "@commands/Master/exec";
import { LogCommand } from "@commands/Moderation/log";
import { SprikeyClient } from "@structs/SprikeyClient";
import { Categories } from "@structs/typedefs/Command";
import { Collection } from "discord.js";

const commandClasses = {
  CommandsCommand: new CommandsCommand(),
  ExecCommand: new ExecCommand(),
  HelpCommand: new HelpCommand(),
  LogCommand: new LogCommand(),
  PingCommand: new PingCommand()
} as const;

export class CommandManager {

  readonly categories: Map<CategoryKeys, this["commands"]> = new Map<CategoryKeys, this["commands"]>();

  readonly commands = new Collection<string, AvailableCommands>();

  constructor(readonly client: SprikeyClient) {
    for (const command of Object.values(commandClasses)) {
      this.commands.set(command.name, command);

      const selectedCategory = Categories[command.category] as CategoryKeys;
      if (!this.categories.has(selectedCategory)) this.categories.set(selectedCategory, new Collection());

      this.categories.get(selectedCategory)?.set(command.name, command);
    }
  }

}

export type AvailableCommands = (typeof commandClasses)[keyof typeof commandClasses];
type CategoryKeys = keyof typeof Categories;