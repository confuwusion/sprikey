import { SprikeyClient } from "../SprikeyClient";

type ActionName = { name: string };

export type ActionValue<T> = ActionName & { data: T };

export type ActionRegistry = ActionName & { code: number };

interface ActionStructure<T> {
  description: string,
  usage: string[],
  parse(client: SprikeyClient, args: string[]): T;
  perform(client: SprikeyClient, args: ReturnType<this["parse"]>): void;
}


export class Action<T> implements ActionStructure<T> {

  readonly name: string;
  readonly description: ActionStructure<T>["description"];
  readonly usage: ActionStructure<T>["usage"];
  readonly perform: ActionStructure<T>["perform"];
  readonly parse: ActionStructure<T>["parse"];

  constructor(name: string, {
    description,
    usage,
    perform,
    parse
  }: ActionStructure<T>) {
    this.name = name;
    this.description = description;
    this.usage = usage;
    this.perform = perform;
    this.parse = parse;
  }
}
