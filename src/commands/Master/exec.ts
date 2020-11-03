/* eslint-disable class-methods-use-this */
import { ICONS } from "@constants/Icons";
import { SprikeyClient } from "@structs/SprikeyClient";
import { Categories, Command, CommandArguments } from "@structs/typedefs/Command";
import { Benchmark } from "@util/Benchmark";
import { Message } from "discord.js";
import { inspect } from "util";

export default class ExecCommand extends Command<ExecArgs> {

  constructor() {
    super(`exec`, {
      description: `Executes NodeJS code`,
      category: Categories.Master,
      icon: ICONS.EXEC,
      args: new CommandArguments({
        detectors: [ /[^]+/ ],
        usages: [ {
          title: `Execute code`,
          parameters: [
            `[Code]`
          ]
        } ]
      })
    });
  }

  async run(client: SprikeyClient, { channel }: Message, args: ExecArgs): Promise<void> {

    let evalResult: string | Promise<unknown> = ``;
    let evalOutput = ``;

    const benchmark = new Benchmark(`Benchmark`);
    const execBenchmark = new Benchmark(`Exec Benchmark`);

    try {
      execBenchmark.start();
      evalResult = eval(`${args.content}`) as string | Promise<unknown>;
      execBenchmark.stop();

      evalOutput = inspect(evalResult);
    } catch (err) {
      const error = err as Error;
      let modifiedMessage = ``;

      if (error.stack) {
        // let {errorMessage, lineCode} = e.stack.match(/(?<errorMessage>[^\n]+)\n\s*at eval \(eval at exports.run \(\/home\/spuggle\/spuiiBot\/commands\/exec.js\:\d+\:\d+\), \<anonymous\>\:(?<lineCode>\d+:\d+)\)/).groups;
        modifiedMessage = error.stack; // `Line ${lineCode} - ${errorMessage}`
      }
      evalOutput = modifiedMessage;
    }
    const outputMessage = await channel.send(`${`**Execution time:** \`${execBenchmark.display()}\``}${benchmark.timeTaken ? `\n**Benchmark:** \`${benchmark.display()}\`` : ``} \`\`\`js\n< ${evalOutput}\`\`\``);
    if (evalResult instanceof Promise) evalResult.finally(() => {
      execBenchmark.stopTime = process.hrtime.bigint();

      void outputMessage.edit(`${`**Execution time:** \`${execBenchmark.display()}\``}${benchmark.timeTaken ? `\n**Benchmark:** \`${benchmark.display()}\`` : ``} \`\`\`js\n< ${inspect(evalResult)}\`\`\``);
    });
  }

}

interface ExecArgs {
  readonly content: string;
}