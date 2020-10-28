/**
 * Formats time (in milliseconds) to be displayable
 *
 * @param milliseconds - The time (in milliseconds) to format
 * @returns - The formatted time
 */
export function formatTime(milliseconds: number): string {
  const seconds = ~~(milliseconds / 1000);
  const minutes = ~~(seconds / 60);
  const hours = ~~(minutes / 60);
  const days = ~~(hours / 24);
  const weeks = ~~(days / 7);

  const displayMilliseconds = milliseconds && milliseconds % 1000;
  const displaySeconds = seconds && seconds % 60;
  const displayMinutes = minutes && minutes % 60;
  const displayHours = hours && hours % 60;
  const displayDays = days && days % 24;
  const displayWeeks = weeks && weeks % 7;

  return [
    displayWeeks && `${displayWeeks} week${displayWeeks > 1 ? `s` : ``}`,
    displayDays && `${displayDays} day${displayDays > 1 ? `s` : ``}`,
    displayHours && `${displayHours} hour${displayHours > 1 ? `s` : ``}`,
    displayMinutes && `${displayMinutes} minute${displayMinutes > 1 ? `s` : ``}`,
    displaySeconds && `${displaySeconds} second${displaySeconds > 1 ? `s` : ``}`,
    displayMilliseconds && `${displayMilliseconds}ms`
  ].filter(Boolean).join(`, `);
}

/**
 * Formats time (in BigInt nanoseconds) to be displayable
 *
 * @param nanoseconds - The time in (BigInt nanoseconds) to format
 * @returns - The formatted time
 */
export function formatBigIntTime(nanoseconds: bigint): string {
  const microseconds = nanoseconds / BigInt(1000);
  const milliseconds = microseconds / BigInt(1000);

  const displayNanoseconds = nanoseconds && nanoseconds % BigInt(1000);
  const displayMicroseconds = microseconds && microseconds % BigInt(1000);
  const displayMilliseconds = milliseconds && milliseconds % BigInt(1000);

  return [
    formatTime(Number(displayMilliseconds)),
    displayMicroseconds && `${displayMicroseconds}μs`,
    displayNanoseconds && `${displayNanoseconds}ns`
  ].filter(Boolean).join(`, `);
}
