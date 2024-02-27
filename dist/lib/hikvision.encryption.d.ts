/// <reference types="node" />
export declare class HikVisionEncryption {
    static getInitVector(): Buffer;
    static sha256(data: string): string;
    static calcSha256(username: string, salt: string, password: string): string;
    static getEncryptionKey(username: string, salt: string, password: string, iterations: number, irreversible: boolean): Uint8Array;
    static getEncryptContent(iv: Buffer, key: Uint8Array, data: string): string;
    static getDecryptContent(iv: Buffer, key: Uint8Array, data: string): string;
}
