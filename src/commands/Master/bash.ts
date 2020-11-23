import { CommandParameters, SprikeyCommand } from "@structs/SprikeyCommand";
import { exec } from "child_process";
import { Message } from "discord.js";
import * as util from "util";

export default class BashCommand extends SprikeyCommand {

  constructor() {
    super("bash", {
      description: "Executes bash code",
      parameters: new CommandParameters({
        usages: [ {
          title: "Execute bash code",
          parameters: [
            "[Code]"
          ]
        } ]
      })
    }, {
      args: [ {
        id: "code",
        match: "content",
        otherwise: () => this.embeds.error("You did not provie an input!")
      } ],
      ownerOnly: true
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async exec({ channel }: Message, { code }: BashArgs) {
    const bashOutput = await new Promise<string | undefined>(resolve => {
      let status = 0;

      const dir = exec(code, (err, stdout) => {
        return resolve(`**Exited with code ${status}**\`\`\`${err ? `js\n${util.inspect(err)}` : `bash\n${stdout}`}\`\`\``);
      });

      dir.on("exit", exitCode => {
        status = exitCode || 0;
      });
    })
      .catch(err => console.error(err));

    if (!bashOutput) return;

    await channel.send(bashOutput);
  }

}

interface BashArgs {
  readonly code: string;
}