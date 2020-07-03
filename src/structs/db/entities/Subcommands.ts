import {Entity, PrimaryColumn, Column} from "typeorm";
import {BaseEntry} from "../BaseEntry";
import {SprikeyClient} from "../../SprikeyClient";
import {Command} from "../../typedefs/Command";

class SubcommandValue extends BaseEntry<SubcommandValue> {

  @PrimaryColumn()
  readonly name: string;

  @Column()
  readonly hierarchy: number;

  @Column()
  readonly trend: number;

  @Column()
  readonly exclusive: boolean;

  @Column()
  readonly channelIDs: string[];

  @Column()
  readonly fillers: string[];

}

@Entity()
export class Subcommand extends SubcommandValue {

  @Column()
  readonly inherits: string;

  readonly client: SprikeyClient;

  constructor(client: SprikeyClient, inheritor: Command, {
    name,
    exclusive,
    hierarchy = inheritor.permission.hierarchy,
    trend = inheritor.permission.trend,
    channelIDs = inheritor.permission.channels,
    fillers = inheritor.args.fillers
  }: SubcommandValue) {
    super({ name, hierarchy, trend, exclusive, channelIDs, fillers });

    this.inherits = inheritor.name;
    this.client = client;
  }

}

