export namespace PERMISSIONS {
  export enum HIERARCHIES {
    MASTER = 1,
    LEAD_DEVELOPER = 2,
    DEVELOPER = 3,
    OWNER = 4,
    ADMIN = 5,
    MOD = 6,
    TRUSTED = 7,
    EVERYONE = 8,
    BLACKLISTED = 9
  }

  export enum TRENDS {
    CURRENT_BELOW = 1,
    CURRENT_ONLY = 2,
    CURRENT_ABOVE = 3,
    TREND_OFFSET = 1
  }
}
