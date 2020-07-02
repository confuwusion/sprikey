import { Column, Entity, PrimaryColumn } from "typeorm";
import { BaseEntry } from "../BaseEntry";

class ActionEntry<T> extends BaseEntry<ActionEntry<T>> {

  @Column()
  readonly name: string;

  @Column()
  readonly data: T;

}

@Entity()
export class ActionData<T> extends ActionEntry<T> {

  @PrimaryColumn()
  readonly code: string = process.hrtime.bigint().toString(36);

}
