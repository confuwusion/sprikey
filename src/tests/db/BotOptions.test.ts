import { initiateConnection } from "@db/connection";

const con = initiateConnection();

// find
// update

const botOptions = con.then(({ botOptions }) => botOptions);

describe(`Basic Querying`, () => {

  test(`FIND lastActive`, async() => {

    expect(
      typeof await (await botOptions).get(`lastActive`)
    )
      .toBe(`number`);

  });

  test(`UPDATE lastActive`, async() => {

    const timeNow = Date.now();

    expect(
      await (await botOptions).update(`lastActive`, timeNow)
    )
      .toBe(true);

    expect(await (await botOptions).get(`lastActive`))
      .toBe(timeNow);

  });

  test(`FIND pingRecord`, async() => {

    const pingRecord = await (await botOptions).get(`pingRecord`);

    console.log(pingRecord);

    expect(
      Object.keys(pingRecord)
        .every(key => [ `memberID`, `time` ].includes(key))
    )
      .toBe(true);

  });

  test(`UPDATE pingRecord`, async() => {

    const updatedPingRecord = {
      memberID: `38837429922828`,
      time: Date.now()
    };

    expect(
      await (await botOptions).update(`pingRecord`, updatedPingRecord)
    )
      .toBe(true);

    expect(
      await (await botOptions).get(`pingRecord`)
    )
      .toMatchObject(updatedPingRecord);

  });

});
