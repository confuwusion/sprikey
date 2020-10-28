import * as chalk from "chalk";

import { formatBigIntTime } from "./displayTime";

export class Benchmark {

  startTime = BigInt(0);

  stopTime = BigInt(0);

  timeTaken = BigInt(0);

  private readonly applyFormatting = chalk
    .bgHex(`#928EDC`)
    .hex(`#333333`)
    .dim;

  constructor(readonly title: string) {}

  start(): bigint {
    return this.startTime = process.hrtime.bigint();
  }

  stop(): Benchmark {
    const stopTime = process.hrtime.bigint();

    this.timeTaken = stopTime - this.startTime;
    this.stopTime = stopTime;

    return this;
  }

  readable(): string {
    return formatBigIntTime(this.timeTaken);
  }

  display(description = ``): string {
    const readable = this.readable();

    console.log(`${
      this.applyFormatting(` ${this.title} `)
    } ${
      description
    }`, readable);

    return readable;
  }
}
