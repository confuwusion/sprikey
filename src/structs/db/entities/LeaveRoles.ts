import {Column, Entity, PrimaryColumn} from "typeorm";
import {BaseEntry} from "../BaseEntry";

@Entity()
export class LeaveRoles extends BaseEntry<LeaveRoles> {

  @PrimaryColumn()
  memberID: string;

  @Column({ type: `simple-array` })
  roleIDs: string[];

}
