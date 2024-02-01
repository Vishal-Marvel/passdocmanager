"use server"
import crypto from "crypto";

const salt: string = process.env.ENCRYPTION_KEY;

export async function encryptReq(password: string, data: string) {
    try {
        const key = crypto.pbkdf2Sync(password, salt, 20000, 32, 'sha512');

        const cipher = crypto.createCipheriv("aes-256-cbc", key, salt.substring(0,16));
        let encryptedText = cipher.update(data, "utf-8", "hex");
        encryptedText += cipher.final("hex");
        return encryptedText;
    }
    catch (e) {
        console.log(e)
    }
}
export async function decryptReq(password: string, encrptedString: string) {
    const key = crypto.pbkdf2Sync(password, salt, 20000, 32, 'sha512');

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, salt.substring(0,16));
    let decryptedText = decipher.update(encrptedString, "hex", "utf-8");
    decryptedText += decipher.final("utf-8");
    return decryptedText;
}