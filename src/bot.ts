import "./configs/setupenv";
import "reflect-metadata";

import { GUILD } from "@constants/Guild";
import { ROLES } from "@constants/Roles";
import { initiateConnection } from "@db/connection";
import { SprikeyClient } from "@structs/SprikeyClient";
import { Guild, Role } from "discord.js";

async function main(): Promise<void> {
  const client = await prepare();

  console.time(`Bot Login`);
  client.login(process.env.BOT_TOKEN as string)
    .catch(err => {
      console.error(err);
      console.timeEnd(`Bot Login`);
    });

}

async function prepare(): Promise<SprikeyClient> {
  const connection = await initiateConnection();
  const client = new SprikeyClient(connection);

  client.once(`ready`, () => {
    ready(client)
      .catch(async err => {
        console.error(err);

        return client.user?.setPresence({
          status: `dnd`,
          activity: {
            name: `out for errors`,
            type: `WATCHING`
          }
        });
      });
  });

  return client;
}

async function ready(client: SprikeyClient): Promise<void> {
  console.timeEnd(`Bot Login`);
  console.time(`Initiation`);
  console.log(`Bot Connected!`);

  await loadAndCacheStaffRoles(client);

  // cache.bot_last_active_interval = setInterval(() => {
  //   cache.botLastActive = Date.now();
  // }, 15000);

  // cache.subcommands.toArray.entries().map(([ subcommandName, {
  //   inherits,
  //   ...subcommandData
  // } ]) => {
  //   const subbingCommand = dataPack.commands.get(inherits);
  //   const subCommand = subbingCommand.createSub(subcommandData);

  //   dataPack.commands.set(subcommandName, subCommand);
  // });

  await enableBot(client);

  // if (cache.restartMessage.channelID) {
  //   const { channelID, messageID } = cache.restartMessage;
  //   const restartMessage = await client.channels.cache.get(channelID).messages.fetch(messageID);

  //   if (restartMessage) {
  //     (async function() {
  //       await restartMessage.reactions.removeAll();
  //       await restartMessage.react(`709510035960496149`);
  //     })();

  //     delete cache.restartMessage;
  //     cache.save(`restartMessage`);
  //   }
  // }

  console.log(`Bot is now listening to events!`);
  console.timeEnd(`Initiation`);
}

void main();

async function loadAndCacheStaffRoles(client: SprikeyClient): Promise<void> {
  const MAIN_GUILD = client.guilds.cache.get(GUILD.MAIN);
  const TEST_GUILD = client.guilds.cache.get(GUILD.TEST) as Guild;

  const BLANK_ROLE = new Role(client, {}, TEST_GUILD);

  const [
    mainAdmin, mainMod,
    testAdmin, testMod
  ] = await Promise.all([
    MAIN_GUILD ? MAIN_GUILD.roles.fetch(ROLES.MAIN.STAFF.ADMIN) : BLANK_ROLE,
    MAIN_GUILD ? MAIN_GUILD.roles.fetch(ROLES.MAIN.STAFF.MOD) : BLANK_ROLE,
    TEST_GUILD.roles.fetch(ROLES.TEST.STAFF.ADMIN),
    TEST_GUILD.roles.fetch(ROLES.TEST.STAFF.MOD)
  ]);

  client.cache.roles = { mainAdmin, mainMod, testAdmin, testMod };
}


async function enableBot(client: SprikeyClient): Promise<void> {
  await client.user?.setPresence({
    status: `online`,
    activity: {
      name: `with butterflies`,
      type: `PLAYING`
    }
  });

  client.managers.listener.changeAllStatesTo(`enabled`);
}