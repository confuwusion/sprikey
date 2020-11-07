import { initiateConnection } from "@db/connection";
import { ActionData } from "@entities/ActionData";

const entries = {
  clientLog: {
    default: new ActionData(`log`, [ `client`, `Title`, `desc`, true ]),
    updated: new ActionData(`log`, [ `client`, `Changed title`, `desc`, false ])
  },
  modLog: new ActionData(`log`, [ `mod`, `Another title`, `Different desc`, false ])
};

const opts = {
  fields: {
    TYPE: 0,
    TITLE: 1,
    DESCRIPTION: 2,
    CONTENT_STATE: 3
  },
  stateOptions: {
    SHOW: true,
    HIDE: false
  }
};



/*
 * findOne
 * save
 * update
 * remove
 * delete
 */


const con = initiateConnection();

describe(`Basic Querying`, () => {

  const actions = con.then(({ db }) => db.ActionData);
  const { clientLog } = entries;

  test(`INSERT clientLog`, async() => {

    expect((
      await (
        await actions
      ).save(clientLog.default)
    ).mainResult[0])
      .toBe(clientLog.default);

  });

  test(`UPDATE clientLog`, async() => {

    console.log((
      await (
        await actions
      ).update({ code: clientLog.default.code }, { data: clientLog.updated.data })
    ).mainResult);

  });

  test(`FIND [updated] clientLog`, async() => {

    expect(
      await (
        await actions
      ).findOne({ code: clientLog.default.code })
    )
      .toMatchObject({ ...clientLog.updated, code: clientLog.default.code });

  });

  test(`FIND, CHANGE AND SAVE clientLog`, async() => {

    const foundClientLog = await (await actions)
      .findOne({ code: clientLog.default.code });

    expect(foundClientLog)
      .toBeTruthy();

    if (!foundClientLog) return;

    foundClientLog.data[opts.fields.CONTENT_STATE] = opts.stateOptions.HIDE;

    const changedData = foundClientLog.data;

    expect((
      await (
        await actions
      ).save(foundClientLog)
    ).mainResult[0])
      .toMatchObject({ ...clientLog.default, data: changedData });

  });

  test(`FIND invalid`, async() => {

    expect(
      await (
        await actions
      ).findOne({ code: `iejwhwhhs` })
    )
      .toBeUndefined();

  });

});

