import {Column, Entity, PrimaryColumn} from "typeorm";
import {BaseEntry} from "../BaseEntry";

class TimerValue<T> extends BaseEntry<TimerValue<T>> {

  @Column()
  name: string;

  @Column()
  type: "fixed" | "repeating";

  @Column()
  time: number;

  @Column({ type: `simple-json` })
  data: T

}

@Entity()
export class TimerEntry<T> extends TimerValue<T> {

  @PrimaryColumn()
  code: string = process.hrtime.bigint().toString(36);

}
