import {Entity, PrimaryColumn, Column} from "typeorm";
import {BaseEntry} from "../BaseEntry";
import {ClientEvents} from "discord.js";

@Entity()
export class IFTTTWebhook extends BaseEntry<IFTTTWebhook> {

  @PrimaryColumn()
  readonly memberID: string;

  @Column()
  readonly key: string;

  @Column({ type: `simple-array` })
  readonly events: (keyof ClientEvents)[];

}
