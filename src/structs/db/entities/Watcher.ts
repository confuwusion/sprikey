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
  readonly pattern: [ string, RegExpFlags ];

  @Column()
  readonly criteria?: {
    readonly targets?: CriteriaInstances<string[]>,
    readonly include?: CriteriaInstances<boolean>
  }

  @Column()
  readonly options: {
    readonly actions?: ActionRegistry[],
    readonly clean?: boolean,
    readonly tags?: { [index: string]: string }
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
  readonly code: string = process.hrtime.bigint().toString(36);

}
