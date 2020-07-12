import {BaseEntity} from "typeorm";

export class BaseEntry<T> extends BaseEntity {
  constructor(entries: T) {
    super();
    Object.assign(this, entries);
  }
}
