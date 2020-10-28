export namespace ROLES {

  export namespace MAIN {

    export const STAFF = {
      ADMIN: `415234713763184641`,
      MOD: `415225956022878218`
    } as const;

    export const BOT = {
    } as const;

    export const ACTIVITY = {
      ACTIVE_COMMUNIMATOR: `572175207641513984`,
      COMMUNIMATOR: `415558611599884290`
    } as const;

    export const CONTENT = {
      ANIMATOR: `537038945695957012`,
      ARTIST: `442540841014263809`,
      MUSICIAN: `620725759304138772`,
      DJ: `650144386314665994`
    } as const;

    export const REWARD = {
      ART_MASTER: `679433011313508353`
    } as const;

    export const STATUS = {
    } as const;

    export const PUNISHMENT = {
      MUTED: `688790309689098241`,
      NO_IMG: `694013837162184734`
    } as const;

    export const ALL = {
      ...STAFF,
      ...BOT,
      ...ACTIVITY,
      ...CONTENT,
      ...REWARD,
      ...STATUS,
      ...PUNISHMENT
    } as const;

    export const MANAGEABLE = {
      ...ACTIVITY,
      ...CONTENT,
      ...REWARD,
      ...PUNISHMENT
    } as const;

    export type Manageable = (typeof MANAGEABLE)[keyof typeof MANAGEABLE];

  }

  export namespace TEST {

    export const STAFF = {
      ADMIN: `703557194549035069`,
      MOD: `677805482181918721`
    } as const;

    export const BOT = {
    } as const;

    export const ACTIVITY = {
      ACTIVE_COMMUNIMATOR: `703557411729965067`,
      COMMUNIMATOR: `703557517690798100`
    } as const;

    export const CONTENT = {
      // ANIMATOR = "537038945695957012",
      // ARTIST = "442540841014263809",
      // MUSICIAN = "620725759304138772",
      // DJ = "650144386314665994"
    } as const;

    export const REWARD = {
      // ART_MASTER = "6794330113135083"
    } as const;

    export const STATUS = {
    } as const;

    export const PUNISHMENT = {
      // MUTED = "688790309689098241",
      // NO_IMG = "694013837162184734"
    } as const;

    export const ALL = {
      ...STAFF,
      ...BOT,
      ...ACTIVITY,
      ...CONTENT,
      ...REWARD,
      ...STATUS,
      ...PUNISHMENT
    } as const;

    export const MANAGEABLE = {
      ...ACTIVITY,
      ...CONTENT,
      ...REWARD,
      ...PUNISHMENT
    } as const;

    export type Manageable = (typeof MANAGEABLE)[keyof typeof MANAGEABLE];

  }

  export const MANAGEABLE = {
    ...MAIN.MANAGEABLE,
    ...TEST.MANAGEABLE
  } as const;

  export type Manageable = MAIN.Manageable | TEST.Manageable;

}
