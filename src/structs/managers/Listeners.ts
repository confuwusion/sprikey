import { MASTER_ID } from "@constants/Team";
import { messageListener } from "@listeners/client/message";
import { messageDeleteListener } from "@listeners/client/messageDelete";
import { SprikeyClient } from "@structs/SprikeyClient";
import { SizedArray } from "@util/SizedArray";
import { ClientEvents, Message } from "discord.js";
import { EventEmitter } from "events";

const listeners = {
  client: { messageListener, messageDeleteListener }
} as const;

const listenerCategories = Object.keys(listeners) as ListenerCategories[];

const states = {
  enabled: true,
  disabled: false
} as const;

export class ListenerManager {

  readonly listenerEmitters: ListenerObject<EventEmitter>;

  readonly listenerLogs: ListenerObject<SizedArray<string>> = { client: new SizedArray(200) };

  readonly listenerStates: ListenerObject<boolean> = { client: false };

  constructor(readonly client: SprikeyClient) {
    this.listenerEmitters = { client };

    for (const listenerCategory of listenerCategories) {
      this.attachListeners(listenerCategory);
    }
  }

  changeAllStatesTo(state: keyof typeof states): boolean {
    for (const listenerCategory of listenerCategories) {
      this.listenerStates[listenerCategory] = states[state];
    }

    return states[state];
  }

  attachListeners(listenerType: ListenerCategories): void {
    for (const listenerData of Object.values(listeners[listenerType])) {
      type EventParameters = ClientEvents[typeof listenerData.name];

      this.listenerEmitters[listenerType].on(listenerData.name, (...args: unknown[]) => {
        if (!this.listenerStates[listenerType] || (
          listenerData.name === `message` && (args[0] as Message).author.id !== MASTER_ID)
        ) return;

        // @ts-ignore
        void listenerData.listener(this.client, ...args as EventParameters);
      });
    }

    this.listenerLogs[listenerType] = new SizedArray(200);
  }

}

type ListenerCategories = keyof typeof listeners;

type ListenerObject<T> = {
  [ListenerCategory in ListenerCategories]?: T;
} & {
  client: T;
};