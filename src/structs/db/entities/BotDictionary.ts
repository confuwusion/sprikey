import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class BotDictionary {

  @PrimaryColumn()
  figure: string;

  @Column()
  list: {

    // Categorization
    [index: string]: string[]
  }
}
