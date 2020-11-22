import { CommandParameters, SprikeyCommand } from "@structs/SprikeyCommand";
import { Benchmark } from "@util/Benchmark";
import { Message } from "discord.js";
import { inspect } from "util";
import * as vm from "vm";

const vmOptions = {
  filename: "eval"
};
export default class ExecCommand extends SprikeyCommand {

  constructor() {
    super("exec", {
      description: "Executes NodeJS code",
      parameters: new CommandParameters({
        usages: [ {
          title: "Execute code",
          parameters: [
            "[Code]"
          ]
        } ]
      })
    }, {
      args: [ {
        id: "content",
        type: "string",
        match: "content"
      } ]
    });
  }

  // eslint-disable-next-line complexity, class-methods-use-this
  async exec(message: Message, { content }: ExecArgs): Promise<void> {

    const vmContext = {
      message,
      client: this.client,
      command: this,
      execBenchmark: new Benchmark("Exec Benchmark")
    } as const;

    vm.createContext(vmContext);

    let vmResult: unknown = "";
    let execOutput: string | Promise<unknown> = "";

    try {
      vmContext.execBenchmark.start();
      vmResult = vm.runInContext(content, vmContext, vmOptions);
      execOutput = inspect(vmResult);
    } catch (err) {
      execOutput = generateErrorMessage(err as Error);
    }

    vmContext.execBenchmark.stop();

    const outputMessage = await message.channel.send(getOutputContent(vmContext.execBenchmark, execOutput));

    if (vmResult instanceof Promise) (vmResult as Promise<unknown>).finally(() => {
      vmContext.execBenchmark.stop();

      void outputMessage.edit(getOutputContent(vmContext.execBenchmark, execOutput as string));
    });

  }

}

const relevantErrorExtractor = /((?:[^\n]+\n){3})\n([^\n]+)\n\s+at eval:(\d+:\d+)[^]+$/u;
const newlinePattern = /\n/gu;
// eslint-disable-next-line complexity
function generateErrorMessage(error: Error): string {

  const [ , errorIndicator, errorMessage, errorPosition ] = relevantErrorExtractor.exec(error.stack ?? "") || [];

  return `${errorIndicator.replace(newlinePattern, "\n  ")}${errorMessage}
    at exec ${errorPosition}`;
}

function getOutputContent(execBenchmark: Benchmark, evalOutput: string): string {
  return `${`**Execution Time:** \`${execBenchmark.display()}\``} \`\`\`js
< ${evalOutput}
\`\`\``;
}

interface ExecArgs {
  readonly content: string;
}