import { Column, Entity, PrimaryColumn } from "typeorm";

import { TimerEntry } from "./Timers";

const remindQuotes = [
  `The ground rumbles as you remember what you wanted to do`,
  `Echos of dragons deep in the pits remind you what you wanted to do`,
  `Out in the morning light, the sun shone brightly - which reminded you what you wanted to do`,
  `As you spend time thinking about life, you are reminded what you wanted to do`,
  `Gazing at the starry sky, the constellations form to remind you want you wanted to do`,
  `You were running your hand across your golden trophy when you noticed your reflecting and remembered what you wanted to do`,
  `The wind whispers in your ear to remind you of what you had forgotten`
];

@Entity()
class ReminderEntity extends TimerEntry {

  @Column()
  readonly memberID: string;

  @Column()
  readonly channelID: string;

  @Column()
  readonly message: string;

}

export class Reminder extends ReminderEntity {

  static readonly Entity = ReminderEntity;

  @PrimaryColumn()
  readonly code: string = process.hrtime.bigint().toString(36);

  constructor(
    time: Reminder["time"],
    readonly memberID: ReminderEntity["memberID"],
    readonly channelID: ReminderEntity["channelID"] = ``,
    readonly message: ReminderEntity["message"] = remindQuotes[
      ~~(Math.random() * remindQuotes.length)
    ]
  ) {
    super(`scheduled`, time);
  }

}
