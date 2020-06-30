import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class LogChannels {

  @PrimaryColumn()
  id: string;

  @Column()
  type: string;
}
