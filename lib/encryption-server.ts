
import bcrypt from "bcrypt"
import crypto from "crypto";

export async function hashString(inputString:string) {
    const saltRounds = 15;
    return await bcrypt.hash(inputString, saltRounds);
}

export function generateSaltFromPassword(password: string) {
    const hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex').slice(0, 16); // Use first 16 bytes as salt
}

// An encrypt function
export function encrypt(text: string, password: string) {

    const salt = generateSaltFromPassword(password);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
    const cipher = crypto.createCipheriv("aes-256-cbc", key, salt);
    let encryptedText = cipher.update(text, "utf-8", "hex");
    encryptedText += cipher.final("hex");
    return { encryptedText, salt };
}
// Function to compare hashed and original strings
export async function compareStrings(originalString: string, hashedString: string) {
    return await bcrypt.compare(originalString, hashedString);
}

export function decrypt(password: string, encrptedString: string, salt: string) {

    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, salt);
    let decryptedText = decipher.update(encrptedString, "hex", "utf-8");
    decryptedText += decipher.final("utf-8");
    return decryptedText;
}
