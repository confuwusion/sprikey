import { PERMISSIONS } from "@constants/Permissions";
import { CommandHierarchy } from "@entities/CommandHierarchies";
import { SprikeyClient } from "@structs/SprikeyClient";
import { Collection } from "discord.js";

const NO_COMMAND_HIERARCHIES = new Collection<string, number>();

const trendComparers: ((comparingID: number, baseID: number) => boolean)[] = [
  (comparingID, baseID): boolean => comparingID >= baseID,
  (comparingID, baseID): boolean => comparingID === baseID,
  (comparingID, baseID): boolean => comparingID <= baseID
];

export class PermissionsManager {

  readonly commandHierarchies = new Collection<string, CommandHierarchy["commandHierarchies"]>();

  readonly memberHierarchies = new Collection<string, number>();

  constructor(readonly client: SprikeyClient, permissionEntries: CommandHierarchy[]) {
    for (const { memberID, commandHierarchies } of permissionEntries) {
      this.commandHierarchies.set(memberID, commandHierarchies);
    }
  }

  async getCommandHierarchies(memberID: string): Promise<CommandHierarchy["commandHierarchies"]> {
    if (!this.commandHierarchies.has(memberID)) {
      const retrievedHierarchy = await this.client.db.CommandHierarchies.findOne({ memberID });

      if (retrievedHierarchy) this.commandHierarchies.set(memberID, retrievedHierarchy.commandHierarchies);
    }
    const commandHierarchy = this.commandHierarchies.get(memberID);

    return commandHierarchy ?? NO_COMMAND_HIERARCHIES;
  }

  async forCommand(commandName: string, memberID: string): Promise<number> {
    const commandHierarchies = await this.getCommandHierarchies(memberID);
    const commandHierarchy = commandHierarchies.get(commandName);

    const memberHierarchy = this.memberHierarchies.get(memberID);

    return memberHierarchy === PERMISSIONS.HIERARCHIES.MASTER
      ? PERMISSIONS.HIERARCHIES.MASTER
      : commandHierarchy || memberHierarchy || PERMISSIONS.HIERARCHIES.EVERYONE;
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

  static compare(baseID: number, trend: number, comparingID: number): boolean {
    const compareTrends = trendComparers[trend - PERMISSIONS.TRENDS.TREND_OFFSET];

    return comparingID === 1 || compareTrends(comparingID, baseID);
  }

}