import { Column, Entity, PrimaryColumn } from "typeorm";
import {BaseEntry} from "./BaseEntry";

@Entity()
export class LogChannel extends BaseEntry<LogChannel> {

  @PrimaryColumn()
  readonly type: string;

  @Column()
  readonly channelID: string;

}
