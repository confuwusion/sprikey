import { splitArray, SplitArrayResult } from "@util/splitArray";
import * as crypto from "crypto";
import { ClientEvents } from "discord.js";
import { Column, Entity, PrimaryColumn } from "typeorm";

const algorithm = `aes-192-cbc`;
const password = process.env.DB_WEBHOOK_ENCRYPTION_TOKEN;

if (!password) throw new Error(`No database encryption password was provided!`);

const encryptionKey = crypto.scryptSync(password, `salt`, 24);
const iv = Buffer.alloc(16, 0);



type ClientEventNames = keyof ClientEvents;

@Entity()
class IFTTTWebhookEntity {

  @PrimaryColumn()
  readonly memberID: string;

  @Column()
  readonly key: string;

  @Column({ type: `simple-array` })
  readonly events: ClientEventNames[];

  addEvents(...events: IFTTTWebhookEntity["events"]): SplitArrayResult<ClientEventNames> {
    const splitResult = this.filterExistingEvents(events);

    this.events.push(...splitResult.rejected);

    return splitResult;
  }

  removeEvents(...events: IFTTTWebhookEntity["events"]): SplitArrayResult<ClientEventNames> {
    const splitResult = this.filterExistingEvents(events);

    splitResult.accepted.forEach(event => this.events.splice(
      this.events.indexOf(event),
      1
    ));

    return splitResult;
  }

  hasEvent(event: ClientEventNames): boolean {
    return this.events.includes(event);
  }

  private filterExistingEvents(events: ClientEventNames[]): SplitArrayResult<ClientEventNames> {
    return splitArray(events, this.hasEvent.bind(this));
  }

  static async encryptKey(key: string): Promise<string> {
    return new Promise(resolve => {
      const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);

      let encrypted = ``;
      cipher.on(`readable`, () => {
        // eslint-disable-next-line @typescript-eslint/init-declarations
        let chunk: Buffer;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        while ((chunk = cipher.read()) !== null) {
          encrypted += chunk.toString(`base64`);
        }
      });
      cipher.on(`end`, () => {
        resolve(encrypted);
      });

      cipher.write(key);
      cipher.end();
    });

  }

  static async decryptKey(key: string): Promise<string> {
    return new Promise(resolve => {
      const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);

      let decrypted = ``;
      decipher.on(`readable`, () => {
        // eslint-disable-next-line @typescript-eslint/init-declarations
        let chunk: Buffer;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        while ((chunk = decipher.read()) !== null) {
          decrypted += chunk.toString(`utf8`);
        }
      });

      decipher.on(`end`, () => {
        resolve(decrypted);
      });

      decipher.write(key, `base64`);
      decipher.end();
    });
  }

}

export class IFTTTWebhook extends IFTTTWebhookEntity {

  static readonly Entity = IFTTTWebhookEntity;

  constructor(
    readonly memberID: IFTTTWebhookEntity["memberID"],
    readonly key: IFTTTWebhookEntity["key"],
    readonly events: IFTTTWebhookEntity["events"] = []
  ) {
    super();
  }

}
