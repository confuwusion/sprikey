import {Column, Entity, PrimaryColumn} from "typeorm";
import {BaseEntry} from "../BaseEntry";

class TimerValue<T> extends BaseEntry<TimerValue<T>> {

  @Column()
  readonly name: string;

  @Column()
  readonly type: "fixed" | "repeating";

  @Column()
  readonly time: number;

  @Column({ type: `simple-json` })
  readonly data: T

}

@Entity()
export class TimerEntry<T> extends TimerValue<T> {

  @PrimaryColumn()
  readonly code: string = process.hrtime.bigint().toString(36);

}
