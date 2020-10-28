import { getTimeAsCode } from "@util/getTimeAsCode";
import { Column, Entity, PrimaryColumn } from "typeorm";

class ReactionRoleValue {

  @Column()
  readonly messageID: string;

  @Column({ type: `simple-json` })
  readonly reactionRoles: readonly {
    readonly name: string;
    readonly roleID: string;
  }[];

}

@Entity()
export class ReactionRole extends ReactionRoleValue {

  @PrimaryColumn()
  readonly code: string = getTimeAsCode();

}
