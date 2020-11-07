import { PermissionCheck } from "@structs/SprikeyCommand";
import { SizedArray } from "@util/SizedArray";
import { Role } from "discord.js";

/**
 *
 */
export function generateBotCache(): CacheEntries {
  return {
    data: {},
    logs: {
      permissionChecks: new SizedArray(100)
    },
    roles: {}
  };
}

interface CacheEntries {
  data: CacheDataEntries;
  logs: CacheLogEntries;
  roles: { [K: string]: Role | null };
}

interface CacheDataEntries {
  [K: string]: unknown;
}

interface CacheLogEntries {
  permissionChecks: SizedArray<PermissionCheck>;
}