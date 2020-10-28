import { DBDeserializers, DBSerializers } from "@db/lib/serialization";
import { Collection } from "discord.js";
import { Column, Entity } from "typeorm";

@Entity()
class CommandHierarchyEntity {

  @Column()
  readonly memberID: string;

  @Column({ transformer: { from: DBSerializers.absolute, to: DBDeserializers.absolute } })
  readonly commandHierarchies: Collection<string, number>;

}

export class CommandHierarchy extends CommandHierarchyEntity {

  static readonly Entity = CommandHierarchyEntity;

  constructor(
    readonly memberID: CommandHierarchyEntity["memberID"],
    readonly commandHierarchies: CommandHierarchyEntity["commandHierarchies"]
  ) {
    super();
  }

}