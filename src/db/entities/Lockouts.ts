import { CHANNELS } from "@constants/Channels";
import { splitArray, SplitArrayResult } from "@util/splitArray";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
class LockoutEntity {

  @PrimaryColumn()
  readonly memberID: string;

  @Column({ type: `simple-array` })
  readonly channelIDs: CHANNELS.Any[];

  addChannels(...channelIDs: LockoutEntity["channelIDs"]): SplitArrayResult<CHANNELS.Any> {
    const splitResult = this.filterExistingChannels(channelIDs);

    this.channelIDs.push(...splitResult.rejected);

    return splitResult;
  }

  removeChannels(...channelIDs: LockoutEntity["channelIDs"]): SplitArrayResult<CHANNELS.Any> {
    const splitResult = this.filterExistingChannels(channelIDs);

    splitResult.accepted.forEach(channelID => this.channelIDs.splice(
      this.channelIDs.indexOf(channelID),
      1
    ));

    return splitResult;
  }

  hasChannel(channelID: CHANNELS.Any): boolean {
    return this.channelIDs.includes(channelID);
  }

  private filterExistingChannels(channelIDs: CHANNELS.Any[]): SplitArrayResult<CHANNELS.Any> {
    return splitArray(channelIDs, this.hasChannel.bind(this));
  }

}

export class Lockout extends LockoutEntity {

  constructor(
    readonly memberID: LockoutEntity["memberID"],
    readonly channelIDs: LockoutEntity["channelIDs"]
  ) {
    super();
  }

}
