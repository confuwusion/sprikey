// Keys
// time
//
// Values
// Cache Instance mapped to <Key=(lastActive,uptime),Value={value specific to key)

import {Column, Entity} from "typeorm";
import {BaseEntry} from "../BaseEntry";

interface Options {
  lastActive: number,
  uptime: number,
  pingRecord: { memberID: string, time: number },
  restartMessage?: { channelID: string, messageID: string }
}

@Entity()
export class BotOption extends BaseEntry<BotOption> {

  @Column()
  readonly option: keyof Options;

  @Column({ type: `simple-json` })
  data: Options[this["option"]];

}
