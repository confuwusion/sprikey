import { Column } from "typeorm";

export class TimerEntry {

  /**
   * Type of timer.
   * Either `repeating` or `scheduled`
   **/
  @Column()
  readonly type: "scheduled" | "repeating";

  /**
   * If repeating: Units of time determining intervals
   * If scheduled: Timestamp (in milliseconds)
   **/
  @Column()
  readonly time: number;

  constructor(
    type: TimerEntry["type"],
    time: TimerEntry["time"]
  ) {
    const dateNow = Date.now();
    if (time <= dateNow) throw new Error(time <= dateNow + 5e3
      ? `The provided time should not be smaller than 5 seconds from now`
      : `The provided time cannot be smaller than the current time!`
    );

    this.type = type;
    this.time = time;
  }

}
