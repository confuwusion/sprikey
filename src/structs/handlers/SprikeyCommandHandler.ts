import { SprikeyClient } from "@structs/SprikeyClient";
import { CommandHandler } from "discord-akairo";
import { Message } from "discord.js";
import * as path from "path";

export default class SprikeyCommandHandler extends CommandHandler {

  constructor(client: SprikeyClient) {
    super(client, {
      automateCategories: true,
      defaultCooldown: 750,
      directory: path.join(__dirname, "../../commands/"),
      fetchMembers: true,
      prefix: process.env.BOT_PREFIX as string,
      ignoreCooldown: ({ author }: Message): boolean => {
        return client.managers.permission.memberHierarchies.has(author.id);
      },
      loadFilter(filePath: string): boolean {
        return !(/((\.test\.js)|(\.js\.map))$/u).test(filePath);
      }
    });

    this.addCustomTypes();
  }

  private addCustomTypes(): void {
    type TypeInput = {
      value: {
        input?: string;
        value?: unknown;
      };
    } | string;

    this.resolver.addTypes({
      // eslint-disable-next-line complexity
      category: (_, input: TypeInput) => {
        const categoryName = typeof input === "string"
          ? input
          : input.value.input;

        const selectedCategory = this.categories.get(categoryName!.replace(/^(\w)/u, (_, firstChar: string) => {
          return firstChar.toUpperCase();
        }));

        return categoryName ? selectedCategory : null;
      },

      // @ts-ignore
      // eslint-disable-next-line complexity
      optional: (_, input: TypeInput) => {
        if (typeof input === "string") return input || 0;

        const { value } = input;
        if (!value.hasOwnProperty("input")) return value;

        return value.input ? value.value : 0;
      }
    });
  }

}