import { deserialize, serialize } from "v8";

const BASE_64 = `base64`;
const NULLISH_GARBAGE_VALUE = {
  serialized: `/w1JAA==`,
  deserialized: 0
};

export namespace DBSerializers {

  /**
   * @param value
   */
  export function absolute<T = unknown>(value: T): string {
    return serialize(value).toString(BASE_64);
  }

  /**
   * @param value
   */
  export function nullish<T = unknown>(value: T): string {
    return absolute(getStringOrNullish(value, `deserialized`));
  }

}

export namespace DBDeserializers {

  /**
   * @param value
   */
  export function absolute<T = unknown>(value: string): T {
    const serialBuffer = Buffer.from(value, BASE_64);

    return deserialize(serialBuffer) as T;
  }

  /**
   * @param value
   */
  export function nullish<T = unknown>(value: string): T {
    return absolute(getStringOrNullish(value, `serialized`));
  }

}

/**
 * @param value
 * @param state
 */
function getStringOrNullish<T extends keyof typeof NULLISH_GARBAGE_VALUE>(
  value: unknown, state: T
): string | (typeof NULLISH_GARBAGE_VALUE)[T] {
  return typeof value === `string`
    ? value
    : NULLISH_GARBAGE_VALUE[state];
}
