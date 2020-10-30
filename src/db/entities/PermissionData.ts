import { DBDeserializers, DBSerializers } from "@db/lib/serialization";
import { Collection } from "discord.js";
import { Column, Entity } from "typeorm";

@Entity()
class PermissionDataEntity {

  @Column()
  readonly memberID: string;

  @Column({ transformer: { from: DBSerializers.absolute, to: DBDeserializers.absolute } })
  readonly commandHierarchies: Collection<string, number>;

}

export class PermissionData extends PermissionDataEntity {

  static readonly Entity = PermissionDataEntity;

  constructor(
    readonly memberID: PermissionDataEntity["memberID"],
    readonly commandHierarchies: PermissionDataEntity["commandHierarchies"]
  ) {
    super();
  }

}