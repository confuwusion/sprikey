import { PERMISSIONS } from "@constants/Permissions";
import { ROLES } from "@constants/Roles";
import { MASTER_ID } from "@constants/Team";
import { TableMetadata } from "@db/config";
import { PermissionData } from "@entities/PermissionData";
import { SprikeyClient } from "@structs/SprikeyClient";
import { Collection } from "discord.js";

const NO_COMMAND_HIERARCHIES = new Collection<string, number>();
const STAFF_ROLES = [ ...Object.values(ROLES.MAIN.STAFF), ...Object.values(ROLES.TEST.STAFF) ];

const trendComparers: ((comparingID: number, baseID: number) => boolean)[] = [
  (comparingID, baseID): boolean => comparingID >= baseID,
  (comparingID, baseID): boolean => comparingID === baseID,
  (comparingID, baseID): boolean => comparingID <= baseID
];

export class PermissionsManager {

  readonly commandHierarchies = new Collection<string, PermissionData["commandHierarchies"]>();

  readonly memberHierarchies = new Collection<string, number>([ [ MASTER_ID, PERMISSIONS.HIERARCHIES.MASTER ] ]);

  readonly permissionsTable: TableMetadata.Managers["PermissionData"];

  constructor(readonly client: SprikeyClient) {
    for (const { memberID, commandHierarchies } of client.connection.loadedEntries.PermissionData) {
      this.commandHierarchies.set(memberID, commandHierarchies);
    }

    this.reloadMemberHierarchies();
  }

  async getCommandHierarchies(memberID: string): Promise<PermissionData["commandHierarchies"]> {
    if (!this.commandHierarchies.has(memberID)) {
      const retrievedHierarchy = await this.client.db.PermissionData.findOne({ memberID });

      if (retrievedHierarchy) this.commandHierarchies.set(memberID, retrievedHierarchy.commandHierarchies);
    }
    const commandHierarchy = this.commandHierarchies.get(memberID);

    return commandHierarchy ?? NO_COMMAND_HIERARCHIES;
  }

  async setCommandHierarchy(
    memberID: string,
    commandName: string,
    commandHierarchy: number
  ): Promise<number | undefined> {
    const commandHierarchies = this.commandHierarchies.has(memberID)
      ? this.commandHierarchies.get(memberID) as Collection<string, number>
      : this.commandHierarchies.set(memberID, new Collection()).get(memberID) as Collection<string, number>;

    commandHierarchies.set(commandName, commandHierarchy);

    const savedEntry = await this.permissionsTable.save({ memberID, commandHierarchies });

    return savedEntry.mainResult[0].commandHierarchies.get(commandName);
  }

  async forCommand(commandName: string, memberID: string): Promise<number> {
    const commandHierarchies = await this.getCommandHierarchies(memberID);
    const commandHierarchy = commandHierarchies.get(commandName);

    const memberHierarchy = this.memberHierarchies.get(memberID);

    return memberHierarchy === PERMISSIONS.HIERARCHIES.MASTER
      ? PERMISSIONS.HIERARCHIES.MASTER
      : commandHierarchy ?? memberHierarchy ?? PERMISSIONS.HIERARCHIES.EVERYONE;
  }


  async hasLowerHierarchy(
    targetMemberID: string,
    comparingMemberID: string,
    commandName: string
  ): Promise<boolean> {
    const [
      comparingHierarchy,
      targetHierarchy
    ] = await Promise.all([
      this.forCommand(commandName, targetMemberID),
      this.forCommand(commandName, comparingMemberID)
    ]);

    return PermissionsManager.compare(
      targetHierarchy,
      PERMISSIONS.TRENDS.CURRENT_BELOW,
      comparingHierarchy
    );
  }

  reloadMemberHierarchies(): void {
    const remainingStaff = this.client.MAIN_GUILD.members.cache
      .filter(member => member.id !== MASTER_ID && STAFF_ROLES.some(STAFF_ROLE => member.roles.cache.has(STAFF_ROLE)));
    this.memberHierarchies.sweep((memberHierarchy, memberID) => remainingStaff.has(memberID));
  }

  static compare(baseID: number, trend: number, comparingID: number): boolean {
    const compareTrends = trendComparers[trend - PERMISSIONS.TRENDS.TREND_OFFSET];

    return comparingID === 1 || compareTrends(comparingID, baseID);
  }

}