import * as crypto from 'crypto';

const algorithm = `aes-192-cbc`;
const key = crypto.scryptSync(process.env.CRYPT_PASS, `salt`, 24);

export function encrypt(decrypted: string): Promise<string> {
  return new Promise(resolve => {
    const iv = Buffer.alloc(16, 0);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = ``;
    cipher.on(`readable`, () => {
      let chunk: Buffer;
      while ((chunk = cipher.read()) !== null) {
        encrypted += chunk.toString(`hex`);
      }
    });
    cipher.on(`end`, () => {
      resolve(encrypted);
    });

    cipher.write(decrypted);
    cipher.end();
  });
}

export function decrypt(encrypted: string): Promise<string> {
  return new Promise(resolve => {
    const iv = Buffer.alloc(16, 0);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = ``;
    decipher.on(`readable`, () => {
      let chunk: Buffer;
      while ((chunk = decipher.read()) !== null) {
        decrypted += chunk.toString(`utf8`);
      }
    });
    decipher.on(`end`, () => {
      resolve(decrypted);
    });

    decipher.write(encrypted, `hex`);
    decipher.end();
  });
}
