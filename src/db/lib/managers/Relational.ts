import { DeepPartial, DeleteResult, Repository, UpdateResult } from "typeorm";

import { BaseDBManager } from "./Base";

export class DatabaseManager<DataEntity> extends BaseDBManager<DataEntity> {

  /**
   * Finds multiple entries that matches the given options
   *
   * @param criteria - The properties to find in entries
   *
   * @returns - Matched entries
   **/
  async find(
    criteria: RepositoryParameters.Find<DataEntity> = {}
  ): Promise<DataEntity[]> {
    const cachedEntries = await this.repository.cache.find(criteria);
    if (cachedEntries.length) return cachedEntries;

    const mainEntries = await this.repository.main.find(criteria);
    if (mainEntries.length) await this.repository.cache.save(mainEntries);

    return mainEntries;
  }

  /**
   * Finds the first entry that matches the given options
   *
   * @param criteria - The properties to find in the entry
   *
   * @returns - Matched entry
   **/
  async findOne(
    criteria: RepositoryParameters.FindOne<DataEntity>
  ): Promise<DataEntity | undefined> {
    const cachedEntry = await this.repository.cache.findOne(criteria);
    if (cachedEntry) return cachedEntry;

    const mainEntry = await this.repository.main.findOne(criteria);
    if (mainEntry) await this.repository.cache.save([ mainEntry ]);

    return mainEntry;
  }

  /**
   * Update or insert the given entry to the database
   *
   * @param entity - The entry to save
   * @param options - Save configurations
   *
   * @returns - The entry saved in both main and cache databases
   **/
  async save(
    entity: DataEntity,
    options: RepositoryParameters.Save.Options<DataEntity> = {}
  ): Promise<ManagerResults.Save<DataEntity>> {
    return this.saveMany([ entity ], options);
  }

  /**
   * Update or insert the given entries to the database
   *
   * @param entities - The entries to save
   * @param options - Save configurations
   *
   * @returns - The entries saved in both main and cache databases
   **/
  async saveMany(
    entities: RepositoryParameters.Save.Entities<DataEntity>,
    options: RepositoryParameters.Save.Options<DataEntity> = {}
  ): Promise<ManagerResults.Save<DataEntity>> {
    const [ mainResult, cacheResult ] = await Promise.all([
      this.repository.main.save(entities, options),
      this.repository.cache.save(entities, options)
    ]);

    return { cacheResult, mainResult };
  }

  /**
   * Update certain keys of entries that match the given criteria
   *
   * @param criteria - The properties to match in an entry
   * @param partialEntity - The properties to update in the matching entries
   *
   * @returns - The result of the updating
   **/
  async update(
    criteria: RepositoryParameters.Update.Criteria<DataEntity>,
    partialEntity: RepositoryParameters.Update.PartialEntity<DataEntity>
  ): Promise<ManagerResults.Update> {
    const [ mainResult, cacheResult ] = await Promise.all([
      this.repository.main.update(criteria, partialEntity),
      this.repository.cache.update(criteria, partialEntity)
    ]);

    return { cacheResult, mainResult };
  }

  /**
   * Removes the provided entries from the database
   *
   * @param entries - The entries to remove
   * @param options - Remove configurations
   *
   * @returns - The removed entries
   */
  async remove(
    entries: DataEntity,
    options: RepositoryParameters.Remove<DataEntity> = {}
  ): Promise<[DataEntity, DataEntity]> {
    return Promise.all([
      this.repository.main.remove(entries, options),
      this.repository.cache.remove(entries, options)
    ]);
  }

  /**
   * Removes all entries that match the given criteria
   *
   * @param criteria - Properties to match in an entry
   *
   * @returns - The removed entries
   **/
  async delete(
    criteria: RepositoryParameters.Delete<DataEntity>
  ): Promise<ManagerResults.Delete> {
    const [ mainResult, cacheResult ] = await Promise.all([
      this.repository.main.delete(criteria),
      this.repository.cache.delete(criteria)
    ]);

    return { cacheResult, mainResult };
  }

}

namespace RepositoryParameters {

  export type Find<DataEntity> = Parameters<Repository<DataEntity>["find"]>[number];

  export type FindOne<DataEntity> = Parameters<Repository<DataEntity>["findOne"]>[number];

  export namespace Save {

    export type Entities<DataEntity> = Parameters<Repository<DataEntity>["save"]>[0][];

    export type Options<DataEntity> = Parameters<Repository<DataEntity>["save"]>[1];

  }

  export namespace Update {

    export type Criteria<DataEntity> = Parameters<Repository<DataEntity>["update"]>[0];

    export type PartialEntity<DataEntity> = Parameters<Repository<DataEntity>["update"]>[1];

  }

  export type Remove<DataEntity> = Parameters<Repository<DataEntity>["remove"]>[1];

  export type Delete<DataEntity> = Parameters<Repository<DataEntity>["delete"]>[0];

}

namespace ManagerResults {

  export interface Save<DataEntity> {
    cacheResult: DeepPartial<DataEntity>[];
    mainResult: DeepPartial<DataEntity>[];
  }

  export interface Delete {
    cacheResult: DeleteResult;
    mainResult: DeleteResult;
  }

  export interface Update {
    cacheResult: UpdateResult;
    mainResult: UpdateResult;
  }

}
