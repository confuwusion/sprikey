import { SprikeyClient } from "@structs/SprikeyClient";
import { Message } from "discord.js";

const COMMAND_MESSAGE_PATTERN = /^(?<commandName>\w+|\$)(?:\s(?<commandArguments>[^]*))?$/;

export namespace messageListener {

  export const name = `message`;

  export async function listener(client: SprikeyClient, rawMessage: Message): Promise<void> {
    const message = rawMessage.partial as boolean ? await rawMessage.fetch() : rawMessage;

    if (message.author.bot || (!message.guild && !message.content.startsWith(`$staffmail`))) return;
    if (!process.env.BOT_PREFIX) throw new Error(`Bot prefix is not defined!`);

    const messageContent = message.content.trim();
    if (!messageContent.startsWith(process.env.BOT_PREFIX)) return;

    const matchedArgs = COMMAND_MESSAGE_PATTERN.exec(messageContent.slice(1));
    const { commandName, commandArguments = `` } = matchedArgs?.groups ?? {} as ArgumentExtraction;
    if (!commandName) return;

    const command = client.managers.command.commands.get(commandName.toLowerCase());
    if (!command) return;

    const hasPermission = await command.hasPermission(client, message);
    if (!hasPermission) return;

    const extractedArgs = command.extractArgs(commandArguments);

    const parsedArgs = await command.parse(client, message, extractedArgs);

    await command.run(client, message, parsedArgs);
  }

}

// export async function clientWatcherHandler(client: SprikeyClient, rawMessage: Message): Promise<void> {
//   const message = rawMessage.partial as boolean ? await rawMessage.fetch() : rawMessage;

//   if (message.author.bot) return;

//   const prefix = process.env.BOT_PREFIX;
//   if (!prefix) throw new Error(`Bot prefix is not defined!`);

//   if ([ `${prefix}watch`, `${prefix}censor`, `${prefix}synonym` ].includes(message.content.split(` `)[0])) {
//     const baseHierarchy = client.managers.permission.memberHierarchies.get(message.author.id) ?? 0;
//     if (baseHierarchy < 3) return;
//   }

//   const matches = cache.watchPatterns.matches(dataPack);

//   for (const [ , { actionRegistries, replaceOptions } ] of matches) {

//     for (const { actionName, actionCode } of actionRegistries) {
//       botActions.emit(actionName, actionCode, message, replaceOptions);
//     }

//   }
// }


interface ArgumentExtraction {
  readonly commandName: string;
  readonly commandArguments: string;
}