import {Column, Entity, PrimaryColumn} from "typeorm";
import {BaseEntry} from "../BaseEntry";
import {ActionRegistry} from "../../typedefs/Action";


interface CriteriaInstances<T> {
  channels?: T,
  members?: T,
  roles?: T
}

type RegExpFlags = `i` | ``;

class WatchData extends BaseEntry<WatchData> {

  @Column()
  pattern: [ string, RegExpFlags ];

  @Column()
  criteria?: {
    targets?: CriteriaInstances<string[]>,
    include?: CriteriaInstances<boolean>
  }

  @Column()
  options: {
    actions?: ActionRegistry[],
    clean?: boolean,
    tags?: { [index: string]: string }
  };

  constructor({
    pattern,
    criteria: {
      targets: { channels = [], members = [], roles = [] },
      include: { channels: cB = true, members: mB = true, roles: rB = true }
    } = { targets: {}, include: {} },
    options: {
      actions,
      clean = false,
      tags = {}
    } = {}
  }: WatchData) {
    super({
      pattern,
      criteria: {
        targets: { channels, members, roles },
        include: { channels: cB, members: mB, roles: rB }
      },
      options: { actions, clean, tags }
    });
  }
}

@Entity()
export class WatchEntry extends WatchData {

  @PrimaryColumn()
  code: string = process.hrtime.bigint().toString(36);

}
