import { CHANNELS } from "@constants/Channels";
import { CommandParameters, SprikeyCommand } from "@structs/SprikeyCommand";
import { Message, MessageEmbed } from "discord.js";

export default class StaffMailCommand extends SprikeyCommand {

  constructor() {
    super("staffmail", {
      description: "Send a message to the staff (works in DMs)",
      parameters: new CommandParameters({
        usages: [ {
          title: "Send a message to staff",
          parameters: [ "[Message]" ]
        } ]
      })
    }, {
      aliases: [ "modmail", "mail", "report", "staffreport", "modreport" ],
      args: [ {
        id: "isAnonymous",
        match: "flag",
        flag: [ "--anonymous", "--anon", "-a" ]
      }, {
        id: "mailMessage",
        type: "string",
        match: "rest",
        otherwise: () => this.embeds.error("You need to provide the message that you want to deliver!")
      } ]
    });
  }

  async exec({ author, channel }: Message, { isAnonymous, mailMessage }: StaffMailArg) {
    const modChannel = process.env.MODE === "production"
      ? this.client.MAIN_GUILD?.channels.cache.get(CHANNELS.MAIN.MOD.MOD_DEBATE) as Message["channel"] | undefined
      : this.client.TEST_GUILD.channels.cache.get(CHANNELS.TEST.MOD.MOD_DEBATE) as Message["channel"];

    if (!modChannel) return channel.send(this.embeds.error("I could not send your message. Please try again, or talk to the Communimate staff members directly."));

    const mailEmbed = isAnonymous
      ? this.embedTemplate()
      : new MessageEmbed().setAuthor(author.tag, author.displayAvatarURL({ format: "png", dynamic: true }));

    mailEmbed
      .setDescription(mailMessage)
      .setColor(10526880);

    await modChannel.send(mailEmbed);

    return channel.send(
      this.embeds.success("Successfully sent your message to the Communimate staff!")
        .addField("Your Message", mailMessage)
    );
  }
}

interface StaffMailArg {
  readonly isAnonymous: boolean;
  readonly mailMessage: string;
}