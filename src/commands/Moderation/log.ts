import { CHANNELS } from "@constants/Channels";
import { ICONS } from "@constants/Icons";
import { CHANNNEL_PATTERN } from "@constants/Patterns";
import { LogChannel } from "@entities/LogChannels";
import { SprikeyClient } from "@structs/SprikeyClient";
import { ActionCommand } from "@structs/typedefs/ActionCommand";
import { Categories, CommandArguments, ParseArg } from "@structs/typedefs/Command";
import { Message, MessageEmbed } from "discord.js";

const logActions: LogArg["action"][] = [ `view`, `remove`, `set` ];

export class LogCommand extends ActionCommand<LogArg> {

  constructor() {
    super(`log`, {
      description: `Manages logging channels`,
      category: Categories.Moderation,
      icon: ICONS.LOG,
      args: new CommandArguments({
        usages: [ {
          title: `View all logging channels`,
          parameters: [
            `view`
          ]
        }, {
          title: `Set a logging channel`,
          parameters: [
            `set`,
            `[Log Type]`,
            `[Channel Tag]`
          ]
        }, {
          title: `Remove a logging channel`,
          parameters: [
            `remove`,
            `[Log Type]`
          ]
        } ],
        detectors: [
          /^set|view|remove/i,
          /^\w+/,
          /^(?:<#)?\d+>?/
        ]
      })
    });
  }

  async view(client: SprikeyClient, { channel }: Message): Promise<void> {
    const associations = (await client.db.LogChannels.find())
      .map(({ type, channelID }) => `${type}: <#${channelID}>`)
      .join(`\n`);

    await channel.send(this.embeds.default(associations));
  }

  async remove(client: SprikeyClient, { channel }: Message, { type: logType }: LogArgs["remove"]): Promise<void> {
    const logChannel = await client.db.LogChannels.findOne({ type: logType });
    if (!logChannel) return;

    await client.db.LogChannels.delete(logChannel);

    await channel.send(
      this.embeds.success(`Successfully removed the log association **${logType}** from channel <#${logChannel.channelID}>!`)
    );
  }

  async set({ db }: SprikeyClient, { channel }: Message, { type, channelID }: LogArgs["set"]
  ): Promise<void> {
    const logChannel = new LogChannel(type, channelID);
    await db.LogChannels.save(logChannel);

    await channel.send(this.embeds.success(`Successfully set channel <#${channelID}> as **${type}** channel!`));
  }

  async parse(
    { db }: SprikeyClient,
    { guild }: Message,
    [ [ rawAction ], [ type ], [ channelTag ] ]: ParseArg
  ): Promise<LogArg | MessageEmbed> {
    if (!rawAction) return this.embeds.error(`You need to provide the action you want to perform in this command!`);

    const action = rawAction.toLowerCase();
    if (!ActionCommand.isAction(action, logActions)) return this.embeds.error(`Unknown action`);

    if (action === `view`) return { action };

    const registered = await db.LogChannels.findOne({ type });

    if (action === `remove`) {
      if (!registered) return this.embeds.error(`There is no registered channel to log action **${type}**!`);
      return { action, type };
    }

    if (registered && guild?.channels.resolve(registered.channelID)) return this.embeds.error(`The log action **${type}** is already registered to channel <#${registered.channelID}>!`);

    const [ , channelID ] = CHANNNEL_PATTERN.exec(channelTag) ?? [];
    if (!channelID) return this.embeds.error(``);

    const selectedChannel = guild?.channels.resolve(channelID);

    if (!selectedChannel) return this.embeds.error(`The channel by ID \`${channelID}\` does not exist!`);

    if (!LogChannel.isLogSafe(channelID, selectedChannel.parentID)) return this.embeds.error(`Provided channel cannot be set as a log channel!`);

    return { action, type, channelID };
  }


}

type LogArg = (LogArgs)[keyof LogArgs];

interface LogArgs {
  view: { readonly action: "view" };
  remove: { readonly action: "remove" } & LogType;
  set: {
    readonly action: "set";
    readonly channelID: CHANNELS.LogSafe;
  } & LogType;
}

type LogType = { readonly type: string };