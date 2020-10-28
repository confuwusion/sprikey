import { CATEGORIES, CHANNELS } from "@constants/Channels";
import { GuildChannel } from "discord.js";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
class LogChannelEntity {

  @PrimaryColumn()
  readonly type: string;

  @Column()
  readonly channelID: CHANNELS.LogSafe;

}

export class LogChannel extends LogChannelEntity {

  static readonly Entity = LogChannelEntity;

  constructor(
    readonly type: LogChannelEntity["type"],
    readonly channelID: LogChannelEntity["channelID"]
  ) {
    super();
  }

  static fromChannel({ id, parentID }: GuildChannel, type: LogChannelEntity["type"]): LogChannel | Error {
    const LogSafeCategories = Object.values(CATEGORIES.MAIN.LOG_SAFE) as string[];

    return parentID && !LogSafeCategories.includes(parentID)
      ? new Error(`The provided channel cannot be set as a log channel!`)
      : new LogChannel(type, id as CHANNELS.LogSafe);
  }

}
