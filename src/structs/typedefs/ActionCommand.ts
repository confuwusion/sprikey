import { SprikeyClient } from "@structs/SprikeyClient";
import { Message } from "discord.js";

import { Command } from "./Command";

export class ActionCommand<CommandArg extends ActionArg> extends Command<CommandArg> {

  async run(client: SprikeyClient, message: Message, args: ActionArg): Promise<void> {

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this[args.action](client, message, args as never);
  }

  // eslint-disable-next-line
  async view(client: SprikeyClient, message: Message, args: ActionArgs["view"]): Promise<void> {
    throw new Error(`[Command Error]: View action not implemented in command '${this.name}'!`);
  }

  static isAction<ActionType extends string>(action: string, actions: ActionType[]): action is ActionType {
    return actions.includes(action as ActionType);
  }

}

type ActionArg = ActionArgs[keyof ActionArgs];

interface ActionArgs {
  view: { readonly action: string };
}