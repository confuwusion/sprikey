import { initiateConnection } from "@db/connection";
import { IFTTTWebhook } from "@entities/IFTTTWebhooks";

const entries = {
  guildMemberAdd: new IFTTTWebhook(
    `848382883`,
    process.hrtime.bigint().toString(36),
    [ `guildMemberAdd` ]
  )
};

const con = initiateConnection();
const IFTTTWebhooks = con.then(({ db }) => db.IFTTTWebhooks);

// findOne
// save
// update
// remove
// delete

describe(`Basic Querying`, () => {


  test(`INSERT guildMemberAdd`, async() => {

    await (await IFTTTWebhooks)
      .save(entries.guildMemberAdd);

    expect(
      await (await IFTTTWebhooks)
        .findOne({
          memberID: entries.guildMemberAdd.memberID
        })
    )
      .toMatchObject(entries.guildMemberAdd);

  });

  test(`UPDATE guildMemberAdd: Add events`, async() => {

    const webhook = await (await IFTTTWebhooks)
      .findOne({
        memberID: entries.guildMemberAdd.memberID
      });

    if (!webhook) return;

    webhook.addEvents(`message`, `inviteCreate`);

    await (await IFTTTWebhooks).save(webhook);

    const savedWebhook = await (await IFTTTWebhooks).findOne({
      memberID: entries.guildMemberAdd.memberID
    });

    expect(savedWebhook?.events)
      .toMatchObject([
        `guildMemberAdd`,
        `message`,
        `inviteCreate`
      ]);

  });

  test(`UPDATE guildMemberAdd: Remove events`, async() => {
    const webhook = await (await IFTTTWebhooks)
      .findOne({
        memberID: entries.guildMemberAdd.memberID
      });

    if (!webhook) return;

    webhook.removeEvents(`message`);

    await (await IFTTTWebhooks).save(webhook);

    const savedWebhook = await (await IFTTTWebhooks).findOne({
      memberID: entries.guildMemberAdd.memberID
    });

    expect(savedWebhook?.events)
      .toMatchObject([
        `guildMemberAdd`,
        `inviteCreate`
      ]);
  });

});

describe(`Class Features`, () => {

  test(`Decryption of persisted encryped key`, async() => {

    const expectedKey = `je7w7yejehsywu872`;
    const webhook = new IFTTTWebhook(
      `92927737281882`,
      await IFTTTWebhook.encryptKey(expectedKey),
      [ `inviteCreate`, `roleCreate` ]
    );

    await (await IFTTTWebhooks).save(webhook);

    const persistedWebhook = await (await IFTTTWebhooks)
      .findOne({ memberID: webhook.memberID });

    if (!persistedWebhook) throw new Error(`Did not find persisted webhook!`);

    expect(
      await IFTTTWebhook.decryptKey(persistedWebhook.key)
    )
      .toBe(expectedKey);

  });

});
