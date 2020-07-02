import {Entity, PrimaryColumn, Column} from "typeorm";
import {BaseEntry} from "../BaseEntry";

export class Reminder extends BaseEntry<Reminder> {

  @PrimaryColumn()
  readonly memberID: string;

  @Column()
  readonly timerCodes: string[];

}
