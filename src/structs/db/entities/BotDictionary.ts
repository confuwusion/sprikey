import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class BotDictionary {

  @PrimaryColumn()
  readonly figure: string;

  @Column()
  readonly list: {

    // Categorization
    [index: string]: string[]
  }
}
