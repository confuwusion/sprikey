import {Column, Entity} from "typeorm";
import {BaseEntry} from "../BaseEntry";

@Entity()
export class Lockout extends BaseEntry<Lockout> {

  @Column()
  readonly memberID: string;

  @Column({ type: `simple-array` })
  readonly channelIDs: string[];

}
