import { DBDeserializers, DBSerializers } from "@db/lib/serialization";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
class PermissionDataEntity {

  @PrimaryColumn()
  readonly memberID!: string;

  @Column({ type: "varchar", length: 2 ** 14, transformer: { from: DBSerializers.absolute, to: DBDeserializers.absolute } })
  readonly commandHierarchies!: Map<string, number>;

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