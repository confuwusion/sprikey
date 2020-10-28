/**
 *
 */
export function getTimeAsCode(): string {
  return process.hrtime.bigint().toString(36);
}
