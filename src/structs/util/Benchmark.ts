import { displayBigIntTime } from "../../util/displayTime";

export class Benchmark {

  startTime: bigint = BigInt(0);
  stopTime: bigint = BigInt(0);
  timeTaken: bigint = BigInt(0);

  constructor(start?: boolean) {
    if (start) this.start();
  }

  start(): bigint {
    return this.startTime = process.hrtime.bigint();
  }

  stop(): bigint {
    const stopTime = process.hrtime.bigint();
    this.timeTaken = stopTime - this.startTime;

    return this.stopTime = stopTime;
  }

  display(): string {
    return displayBigIntTime(this.timeTaken);
  }
}
