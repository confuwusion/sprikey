// Keys
// time
//
// Values
// Cache Instance mapped to <Key=(lastActive,uptime),Value={value specific to key)

import {Column, Entity} from "typeorm";
import {BaseEntry} from "../BaseEntry";

interface Options {
  lastActive: number,
  uptime: number
}

@Entity()
export class BotOption extends BaseEntry<BotOption> {

  @Column({ type: `simple-enum` })
  option: keyof Options;

  @Column({ type: `simple-json` })
  data: Options[this["option"]];

}
