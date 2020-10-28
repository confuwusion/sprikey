import { getTimeAsCode } from "@util/getTimeAsCode";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
class ActionEntity {

  @PrimaryColumn()
  readonly code: string = getTimeAsCode();

  @Column()
  readonly name: string;

  @Column({ type: `simple-json` })
  readonly data: (string | number | boolean)[];

}

export class ActionData extends ActionEntity {

  static readonly Entity = ActionEntity;

  constructor(
    readonly name: ActionEntity["name"],
    readonly data: ActionEntity["data"]
  ) {
    super();
  }

}

