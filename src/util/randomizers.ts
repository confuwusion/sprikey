import { randomBytes } from "crypto";

export function randomNumber(upperBound: number, lowerBound = 0): number {
  return Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
}

export function cryptoRandomNumber(upperBound: number, lowerBound = 0, strength = 1): number {
  if (strength < 1) throw new Error("Provided Crypto Random Strength out of range!");

  const byteLength = 3 + strength;
  const bytes = randomBytes(byteLength).readUInt32LE() / 0x100000000;

  // const randomNumber = parseInt(bytes, 16) * (10 ** ((bytes.length * -1) - 2));

  return Math.floor(bytes * (upperBound - lowerBound + 1)) + lowerBound;
}

export function randomElement<ArrayType extends unknown[]>(sourceArray: ArrayType, fromIndex = 0): ArrayType[number] {
  const randomIndex = randomNumber(sourceArray.length - 1, fromIndex);

  return sourceArray[randomIndex];
}

export function cryptoRandomElement<ArrayType extends unknown[]>(
  sourceArray: ArrayType, fromIndex = 0, strength = 1
): ArrayType[number] {
  const randomIndex = cryptoRandomNumber(sourceArray.length - 1, fromIndex, strength);

  return sourceArray[randomIndex];
}