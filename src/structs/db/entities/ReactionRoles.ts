import {BaseEntry} from "../BaseEntry";
import {Column, Entity, PrimaryColumn} from "typeorm";

class ReactionRoleValue extends BaseEntry<ReactionRoleValue> {

  @Column()
  readonly messageID: string;

  @Column({ type: `simple-json` })
  readonly reactionRoles: ReadonlyArray<{
    readonly name: string,
    readonly roleID: string
  }>;

}

@Entity()
export class ReactionRole extends ReactionRoleValue {

  @PrimaryColumn()
  readonly code: string = process.hrtime.bigint().toString(36);

}
