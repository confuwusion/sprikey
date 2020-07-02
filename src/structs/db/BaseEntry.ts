export class BaseEntry<T> {
  constructor(entries: T) {
    Object.assign(this, entries);
  }
}
