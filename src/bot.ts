import "./configs/setupenv";
import "reflect-metadata";

import { initiateConnection } from "@db/connection";
import { SprikeyClient } from "@structs/SprikeyClient";
import { AppState } from "app";

export default async function startBot(appState: AppState): Promise<void> {
  const client = await prepare(appState);

  console.time("Bot Login");
  client.login(process.env.BOT_TOKEN as string)
    .catch(err => {
      console.error(err);
      console.timeEnd("Bot Login");
    });

}

async function prepare(appState: AppState): Promise<SprikeyClient> {
  const connection = await initiateConnection();
  const client = new SprikeyClient(connection, appState);

  prepareHandlers(client);

  return client;
}

function prepareHandlers({ handlers: { command, listener, inhibitor } }: SprikeyClient): void {
  listener.setEmitters({
    commandHandler: command,
    inhibitorHandler: inhibitor,
    listenerHandler: listener
  });

  command.useInhibitorHandler(inhibitor);
  command.useListenerHandler(listener);

  command.loadAll();
  inhibitor.loadAll();
  listener.loadAll();
}