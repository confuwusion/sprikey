import { Column, Entity, PrimaryColumn } from "typeorm";
import { BaseEntry } from "../BaseEntry";

class ActionEntry extends BaseEntry<ActionEntry> {

  @Column()
  readonly name: string;

  @Column()
  readonly data: (string | number | boolean)[]

}

@Entity()
export class ActionData extends ActionEntry {

  @PrimaryColumn()
  readonly code: string = process.hrtime.bigint().toString(36);

}
