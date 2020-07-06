import {Column, Entity, PrimaryColumn, OneToOne, BaseEntity, getRepository, JoinColumn} from "typeorm";
import {ActionRegistry} from "../../typedefs/Action";

type RegExpFlags = `i` | ``;

class CodedColumn extends BaseEntity {

  @PrimaryColumn()
  readonly code: string = process.hrtime.bigint().toString(36);

}

module Criteria {

  interface InstanceType<T> {
    channels: T,
    members: T,
    roles: T
  }

  export interface CriteriaType {
    targets: InstanceType<string[]>,
    includes: InstanceType<boolean>
  }

  export type CriteriaPromiseType = {
    [K in keyof CriteriaType]: Promise<CriteriaType[K]>
  }

  class Instances<T> extends CodedColumn {

    @Column()
    readonly channels: T;

    @Column()
    readonly members: T;

    @Column()
    readonly roles: T;

    constructor({ channels, members, roles }: InstanceType<T>) {
      super();

      this.channels = channels;
      this.members = members;
      this.roles = roles;
    }

  }

  @Entity()
  class Targets extends Instances<string[]> {

    static async findOrMakeOne(entry: Targets) {
      return (await Targets.findOne(entry))
        || (new Targets(entry)).save();
    }

  }

  @Entity()
  class Includes extends Instances<boolean> {

    static async findOrMakeOne(entry: Includes) {
      return (await Includes.findOne(entry))
        || (new Includes(entry)).save();
    }


  }

  @Entity()
  export class Instance extends CodedColumn {

    @OneToOne(() => Targets)
    @JoinColumn()
    targets: Promise<CriteriaType["targets"]>;

    @OneToOne(() => Includes)
    @JoinColumn()
    includes: Promise<CriteriaType["includes"]>;

    constructor(targets: Targets, includes: Includes) {
      super();

      this.targets = Targets.findOrMakeOne(targets);
      this.includes = Includes.findOrMakeOne(includes);
    }

  }
}

export class WatchEntry extends CodedColumn {

  @Column()
  readonly pattern: Promise<[ string, RegExpFlags ]>;

  @OneToOne(() => Criteria.Instance)
  @JoinColumn()
  readonly criteria: Criteria.CriteriaPromiseType;

  @Column()
  readonly actions: ActionRegistry[];

  @Column()
  readonly options: {
    readonly clean: boolean,
    readonly tags: { [index: string]: string }
  };

  constructor(
    pattern: WatchEntry["pattern"],
    {
      targets: {
        channels = [],
        members = [],
        roles = []
      } = { channels: [], members: [], roles: [] },
      includes: {
        channels: cB = false,
        members: mB = false,
        roles: rB = false
      } = { channels: false, members: false, roles: false }
    }: Criteria.CriteriaType = {
      targets: { channels: [], members: [], roles: [] },
      includes: { channels: false, members: false, roles: false }
    },
    actions: WatchEntry["actions"],
    {
      clean = false,
      tags = {}
    }: WatchEntry["options"] = { clean: false, tags: {} }
  ) {
    super();

    this.pattern = pattern;
    this.actions = actions;
    this.criteria = {
      targets: Promise.resolve({ channels, members, roles }),
      includes: Promise.resolve({ channels: cB, members: mB, roles: rB })
    };
    this.options = { clean, tags };
  }
}
