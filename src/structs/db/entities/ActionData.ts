import { Column, Entity, PrimaryColumn } from "typeorm";
import { BaseEntry } from "../BaseEntry";

class ActionEntry<T> extends BaseEntry<ActionEntry<T>> {

  @Column()
  name: string;

  @Column()
  data: T;

}

@Entity()
export class ActionData<T> extends ActionEntry<T> {

  @PrimaryColumn()
  code: string = process.hrtime.bigint().toString(36);

}
