import { NormalTextColumn } from "@db/lib/ColumnOptions";
import { DBDeserializers, DBSerializers } from "@db/lib/serialization";
import { Column, Entity, PrimaryColumn } from "typeorm";

interface Options {
  lastActive: number;
  uptime: number;
  pingRecord: { memberID: string; time: number };
  restartMessage?: { channelID: string; messageID: string };
}

type OptionKeys = keyof Options;

@Entity()
class BotOptionEntity<OptionKey extends OptionKeys = OptionKeys> {

  @PrimaryColumn(NormalTextColumn)
  readonly option: OptionKey;

  @Column({
    ...NormalTextColumn,
    transformer: {
      from: DBDeserializers.nullish,
      to: DBSerializers.absolute
    }
  })
  data: Options[OptionKey];

}

export class BotOption<OptionKey extends OptionKeys = OptionKeys> extends BotOptionEntity<OptionKey> {

  static readonly Entity = BotOptionEntity;

  constructor(
    readonly option: OptionKey,
    public data: Options[OptionKey]
  ) {
    super();
  }

}
