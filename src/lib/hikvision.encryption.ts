import * as crypto from 'crypto';

export class HikVisionEncryption {
  public static getInitVector() {
    return crypto.randomBytes(16);
  }

  public static sha256(data: string) {
    const bufferData = Buffer.from(data, 'utf-8');
    const hash = crypto.createHash('sha256').update(bufferData);

    return hash.digest().toString();
  }

  public static calcSha256(username: string, salt: string, password: string) {
    const saltEncoder = new TextEncoder();
    const dst = new ArrayBuffer(64);
    const newSalt = new Uint8Array(dst);
    newSalt.set(saltEncoder.encode(salt));

    const validSalt = new TextDecoder().decode(newSalt);

    return this.sha256(username + validSalt + password);
  }

  public static getEncryptionKey(
    username: string,
    salt: string,
    password: string,
    iterations: number,
    irreversible: boolean,
  ) {
    let baseData = '';

    if (irreversible && salt.length > 0) {
      const irreversibleHash = this.calcSha256(username, salt, password);

      if (irreversibleHash.length > 64)
        baseData = irreversibleHash.slice(0, 64);
      else baseData = irreversibleHash;
    } else {
      if (password.length > 64) baseData = password.slice(0, 64);
      else baseData = password;
    }

    baseData += 'AaBbCcDd1234!@#$';

    if (iterations <= 0) iterations = 100;

    for (let i = 0; i < iterations; i++) {
      baseData = this.sha256(baseData);
    }

    const encoder = new TextEncoder();

    const bytes = new Uint8Array(32);
    encoder.encodeInto(baseData, bytes);

    return bytes;
  }

  public static getEncryptContent(iv: Buffer, key: Uint8Array, data: string) {
    const encoder = new TextEncoder();
    const dataBase64 = Buffer.from(encoder.encode(data)).toString('base64');

    const cipher = crypto.createCipheriv('aes-128-ccm', Buffer.from(key), iv);

    let encrypted = cipher.update(dataBase64);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const bytes = encrypted
      .toString('hex')
      .match(/[\dA-F]{2}/gi)
      .map(function (s) {
        return parseInt(s, 16);
      });

    const typedArray = new Uint8Array(bytes);
    return new TextDecoder().decode(typedArray);
  }

  public static getDecryptContent(iv: Buffer, key: Uint8Array, data: string) {
    const bytes = Buffer.from(data, 'hex');

    console.log(data);
    console.log(bytes.toString('hex'));

    const key2 = Buffer.copyBytesFrom(key).subarray(0, 16);
    console.log(key2.toString('hex'));

    const newBuffer = new ArrayBuffer(key.length);
    new Uint8Array(newBuffer).set(key);

    const decipher = crypto.createDecipheriv('aes-128-cbc', key2, iv);

    let decrypted = decipher.update(bytes);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf-8');
  }
}
