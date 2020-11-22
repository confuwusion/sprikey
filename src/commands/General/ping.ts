import { CommandParameters, SprikeyCommand } from "@structs/SprikeyCommand";
import { formatTime } from "@util/formatTime";
import { Message, MessageEditOptions } from "discord.js";

export default class PingCommand extends SprikeyCommand {

  constructor() {
    super("ping", {
      description: "View the bot's ping! (or play the fun minigame)",
      parameters: new CommandParameters({
        blank: "to play a reaction time game and view the bot's ping!",
        usages: [ {
          title: "View the reaction time record",
          parameters: [ "--viewRecord" ]
        } ]
      })
    }, {
      args: [ {
        id: "isViewingRecord",
        match: "flag",
        flag: "--viewRecord"
      } as const ]
    });
  }

  async exec({ channel }: Message, { isViewingRecord }: PingParameters): Promise<void> {
    const pingRecord = await this.client.botOptions.get("pingRecord");

    if (isViewingRecord) return this.showRecordHolder(channel, pingRecord);

    return this.runPingGame(channel, pingRecord);
  }

  showRecordHolder(channel: Message["channel"], { memberID, time }: PingRecord): void {
    const recordHolder = this.client.users.cache.get(memberID)?.username ?? memberID;

    return void channel.send(`${recordHolder} holds the record for the fastest reaction time of ${formatTime(time)}!`);
  }

  async runPingGame(channel: Message["channel"], { time = Infinity }: PingRecord): Promise<void> {

    const pingMessage = await channel.send(this.embeds.default("Ping?"));

    const intermediateMessage = await this.getIntermediateMessage(channel, pingMessage);

    if (!intermediateMessage || pingMessage.deleted) return;

    const timeTaken = intermediateMessage.createdTimestamp - pingMessage.createdTimestamp;
    const isWinner = time > timeTaken;

    void pingMessage.edit(this.getReactionGameMessage(isWinner, intermediateMessage, timeTaken));

    if (isWinner) await this.client.botOptions.update("pingRecord", {
      time: timeTaken,
      memberID: intermediateMessage.author.id
    });

  }

  private async getIntermediateMessage(
    channel: Message["channel"],
    pingMessage: Message
  ): Promise<Message | undefined> {
    const awaitedMessages = await channel.awaitMessages(filterBotMessages, {
      max: 1,
      time: 5000,
      errors: [ "time" ]
    })
      .catch(() => {
        if (pingMessage.deleted) return null;

        void pingMessage.edit(this.getPongMessage());
      });

    return awaitedMessages?.first();
  }

  private getPongMessage(): MessageEditOptions {
    return {
      embed: this.embeds.default(`Pong! \`${Math.round(this.client.ws.ping)}ms\``)
    };
  }

  private getReactionGameMessage(isWinner: boolean, intermediateMessage: Message, timeTaken: number): MessageEditOptions {
    return {
      embed: this.embeds.default(`Pong! \`${Math.round(this.client.ws.ping)}ms\``)
        .setFooter(
          `${isWinner ? "👑 " : ""}${intermediateMessage.author.tag} in ${formatTime(timeTaken)}!`,
          intermediateMessage.author.displayAvatarURL({ format: "png", dynamic: true })
        )
    };
  }

}

function filterBotMessages(awaitedMessage: Message): boolean {
  return !awaitedMessage.author.bot;
}

interface PingParameters {
  readonly isViewingRecord: boolean;
}

interface PingRecord {
  memberID: string;
  time: number;
}