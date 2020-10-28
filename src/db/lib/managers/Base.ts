import { ConfiguredConnections } from "@db/config";
import { Repository } from "typeorm";

export class BaseDBManager<DataEntity> {

  constructor(
    /**
     * The database connections being managed
     **/
    readonly connection: ConfiguredConnections,

    /**
     * The repositories being used to manage
     **/
    readonly repository: {

      /**
       * Repository of the main connection
       **/
      readonly main: Repository<DataEntity>;

      /**
       * Repository of the cache connection
       **/
      readonly cache: Repository<DataEntity>;
    }
  ) {}

}
