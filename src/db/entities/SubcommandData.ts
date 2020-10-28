import { Command } from "@typedefs/Command";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
class SubcommandDataEntity {

  @PrimaryColumn()
  readonly name: string;

  @Column()
  readonly inherits: string;

  @Column()
  readonly hierarchy: number;

  @Column()
  readonly trend: number;

  @Column()
  readonly exclusive: boolean;

  @Column({ type: `simple-json` })
  readonly channelIDs: string[];

  @Column({ type: `simple-json` })
  readonly fillers: string[];

}

export class SubcommandData extends SubcommandDataEntity {

  static Entity = SubcommandDataEntity;

  readonly name: SubcommandDataEntity["name"];

  readonly inherits: SubcommandDataEntity["inherits"];

  readonly hierarchy: SubcommandDataEntity["hierarchy"];

  readonly trend: SubcommandDataEntity["trend"];

  readonly exclusive: SubcommandDataEntity["exclusive"];

  readonly channelIDs: SubcommandDataEntity["channelIDs"];

  readonly fillers: SubcommandDataEntity["fillers"];

  constructor(
    inheritor: Command,
    {
      name,
      exclusive,
      hierarchy = inheritor.permission.hierarchy,
      trend = inheritor.permission.trend,
      channelIDs = inheritor.permission.channels,
      fillers = inheritor.args.fillers
    }: SubcommandDataEntity
  ) {
    super();

    this.name = name;
    this.exclusive = exclusive;
    this.hierarchy = hierarchy;
    this.trend = trend;
    this.channelIDs = channelIDs;
    this.fillers = fillers;
  }

}

