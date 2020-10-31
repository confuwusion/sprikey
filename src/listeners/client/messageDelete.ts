import { SprikeyClient } from "@structs/SprikeyClient";
import { Message, PartialMessage } from "discord.js";

export namespace messageDeleteListener {

  export const name = `messageDelete`;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export async function listener(client: SprikeyClient, message: Message | PartialMessage): Promise<void> {
    // const reactionRole = cache.reactionRoles.get(message.id);
    // if (!reactionRole) return;

    // cache.reactionRoles.delete(message.id);
  }
}