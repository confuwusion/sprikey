import { CHANNELS } from "@constants/Channels";
import { LogChannel } from "@entities/LogChannels";
import { SprikeyClient } from "@structs/SprikeyClient";
import { CommandParameters } from "@structs/SprikeyCommand";
import { ActionCommand } from "@structs/typedefs/ActionCommand";
import { Argument, FailureData } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

const logActions: LogArg["action"][] = [ "view", "delete", "set" ];

export default class LogCommand extends ActionCommand {

  constructor() {
    super("log", {
      actions: logActions,
      description: "Manages logging channels",
      parameters: new CommandParameters({
        usages: [ {
          title: "View all logging channels",
          parameters: [ "view" ]
        }, {
          title: "Set a logging channel",
          parameters: [
            "set",
            "[Log Type]",
            "[Channel Tag]"
          ]
        }, {
          title: "Remove a logging channel",
          parameters: [
            "remove",
            "[Log Type]"
          ]
        } ]
      })
    }, {
      channel: "guild",
      typeResolver: async(type: string) => this.client.db.LogChannels.findOne({ type }),
      errorData: {
        reference: "A log channel by type",
        states: [ "already exists", "does not exist" ],
        missing: [ "type of the log" ]
      }
    });
  }

  async view(client: SprikeyClient, { channel }: Message): Promise<void> {
    const associations = (await client.db.LogChannels.find())
      .map(({ type, channelID }) => `${type}: <#${channelID}>`)
      .join("\n");

    await channel.send(this.embeds.default(associations));
  }

  async delete(client: SprikeyClient, { channel }: Message, { logChannel }: DeleteLogArgs): Promise<void> {
    const { channelID, type } = logChannel;

    await client.db.LogChannels.delete(logChannel);

    await channel.send(
      this.embeds.success(`Successfully removed the log association **${type}** from channel <#${channelID}>!`)
    );
  }

  async set({ db }: SprikeyClient, { channel }: Message, { type, channelID }: LogArgs["set"]
  ): Promise<void> {
    const logChannel = new LogChannel(type, channelID);
    await db.LogChannels.save(logChannel);

    await channel.send(this.embeds.success(`Successfully set channel <#${channelID}> as **${type}** channel!`));
  }

  * parser() {
    const action = (yield) as unknown as typeof logActions[number];
    if (action === "view") return { action };

    const typeOrLogChannel = (yield) as string | Message["channel"];

    if (action === "delete") return { action, logChannel: typeOrLogChannel };

    const channelID = (yield {
      type: Argument.compose("textChannel", (_, channel) => (channel as unknown as Message["channel"]).id),
      otherwise: (_: Message, failureData?: FailureData): MessageEmbed => {
        return this.embeds.error(failureData?.phrase
          ? `A channel corresponding to "${failureData.phrase}" does not exist!`
          : "You did not provide the channel you want to set as log channel!"
        );
      }
    })! as Message["channel"] | null;

    return channelID && { action, type: typeOrLogChannel, channelID };
  }

}

type LogArg = (LogArgs)[keyof LogArgs];

interface LogArgs {
  view: { readonly action: "view" };
  delete: { readonly action: "delete" } & LogType;
  set: {
    readonly action: "set";
    readonly channelID: CHANNELS.LogSafe;
  } & LogType;
}

interface DeleteLogArgs {
  readonly action: "delete";
  readonly logChannel: LogChannel;
}

type LogType = { readonly type: string };