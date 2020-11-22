import { PermissionsManager } from "@structs/managers/Permissions";
import { SprikeyCommand } from "@structs/SprikeyCommand";
import SprikeyInhibitor from "@structs/SprikeyInhibitor";
import { Message } from "discord.js";

export default class HierarchyInhibitor extends SprikeyInhibitor {

  constructor() {
    super("hierarchy", {
      reason: "hierarchy",
      priority: 1
    });
  }

  async exec({ author }: Message, command?: SprikeyCommand): Promise<boolean> {
    if (!command) return true;

    const memberHierarchy = await this.client.managers.permission.forCommand(command.name, author.id);
    const { hierarchy, trend } = command.permissions;

    return !PermissionsManager.compare(hierarchy, trend, memberHierarchy);
  }

}