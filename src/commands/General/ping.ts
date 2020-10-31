import { ICONS } from "@constants/Icons";
import { SprikeyClient } from "@structs/SprikeyClient";
import { Categories, Command, CommandArguments } from "@structs/typedefs/Command";
import { Message } from "discord.js";

export default class PingCommand extends Command<PingArgs> {

  constructor() {
    super(`ping`, {
      description: `View the bot's ping! (or play the fun minigame)`,
      category: Categories.General,
      icon: ICONS.PING,
      args: new CommandArguments({
        blank: `to view the bot's ping`
      })
    });
  }

  async run(client: SprikeyClient, { channel }: Message, { content }: PingArgs): Promise<void> {

    const pingRecord = await client.botOptions.get(`pingRecord`);

    if ((/record/i).test(content)) {
      const recordHolder = client.users.cache.get(pingRecord.memberID)?.username ?? pingRecord.memberID;
      return void channel.send(`${recordHolder} holds the record for the fastest reaction time of ${toUnit(pingRecord.time)}!`);
    }

    const pingMsg = await channel.send(this.embeds.default(`Ping?`));

    await channel.awaitMessages((awaitedMessage: Message) => !awaitedMessage.author.bot, {
      max: 1,
      time: 10000,
      errors: [ `time` ]
    })
      .then(async collected => {
        if (pingMsg.deleted) return;

        const intermediateMessage = collected.first() as Message;
        const timeTaken = intermediateMessage.createdTimestamp - pingMsg.createdTimestamp;

        const isWinner = (pingRecord.time || Infinity) > timeTaken;
        void pingMsg.edit(``, { embed: this.embeds.default(`Pong! \`${Math.round(client.ws.ping)} ms\``)
          .setFooter(
            `${isWinner ? `👑 ` : ``}${intermediateMessage.author.tag} in ${toUnit(timeTaken)}!`,
            intermediateMessage.author.displayAvatarURL({ format: `png`, dynamic: true })
          )
        });

        if (isWinner) await client.botOptions.update(`pingRecord`, {
          time: timeTaken,
          memberID: intermediateMessage.author.id
        });

      })
      .catch(() => pingMsg.deleted
        ? pingMsg.edit(``, {
            embed: {
              title: `Ping`,
              description: `Pong! \`\`${Math.round(client.ws.ping)} ms\`\``,
              color: 5865983
            }
          })
        : pingMsg
      );
  }

}

function toUnit(time: number): string {
  const sec = Math.floor(time % 60000 / 1000);
  const ms = Math.floor(time % 60000 % 1000);
  const sDisplay = sec > 0 ? `${sec}s, ` : ``;
  const msDisplay = ms > 0 ? `${ms}ms` : ``;

  return sDisplay + msDisplay;
}

interface PingArgs {
  content: string;
}