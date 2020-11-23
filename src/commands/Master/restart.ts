import { CommandParameters, SprikeyCommand } from "@structs/SprikeyCommand";
import { Message } from "discord.js";

export default class RestartCommand extends SprikeyCommand {

  constructor() {
    super("restart", {
      description: "Restarts the bot",
      parameters: new CommandParameters({
        blank: "to restart the bot"
      })
    }, {
      ownerOnly: true
    });
  }

  async exec(message: Message) {
    const { channel, id: messageID } = message;
    const restartMessage = {
      channelID: channel.id,
      messageID
    };

    await Promise.all([
      this.client.botOptions.update("restartMessage", restartMessage),
      message.react("710180000896253953")
    ]);

    return process.exit();
  }

}