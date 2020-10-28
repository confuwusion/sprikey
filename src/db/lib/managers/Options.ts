import { BotOption } from "@entities/BotOptions";

import { BaseDBManager } from "./Base";

interface Options {
  lastActive: number;
  uptime: number;
  pingRecord: { memberID: string; time: number };
  restartMessage?: { channelID: string; messageID: string };
}

export class OptionsManager extends BaseDBManager<BotOption> {

  readonly cache: Options = {
    lastActive: 0,
    uptime: 0,
    pingRecord: { time: 0, memberID: `` }
  };

  async get<Option extends keyof Options>(option: Option): Promise<Options[Option]> {
    const cachedOption = this.cache[option];
    if (cachedOption) return cachedOption;

    const noncachedOption = await this.repository.main.findOne({ where: { option } });
    if (!noncachedOption) return cachedOption;

    this.cache[option] = noncachedOption.data as Options[Option];

    return noncachedOption.data as Options[Option];
  }

  async update<Option extends keyof Options>(option: Option, optionValue: Options[Option]): Promise<boolean> {
    this.cache[option] = optionValue;
    const savedOption = await this.repository.main.save([ {
      option,
      data: optionValue
    } ]);

    return savedOption[0].option === option;
  }

  async loadAllEntries<Option extends keyof Options>(): Promise<void> {
    const allOptions = await this.repository.main.find();

    for (const optionEntry of allOptions) {
      const { option, data } = optionEntry as {
        option: Option;
        data: Options[Option];
      };
      this.cache[option] = data;
    }
  }

}
