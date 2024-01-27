
import crypto from "crypto";

const base64String:string|undefined = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

let salt:crypto.BinaryLike;
if (base64String !== undefined) {
    // Decode base64 string to a Buffer
    salt = Buffer.from(base64String, 'base64').subarray(0,16);
}
//@ts-ignore



export function encryptReq(password:string, data:string){
    try{
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
    
    const cipher = crypto.createCipheriv("aes-256-cbc", key, salt);
    let encryptedText = cipher.update(data, "utf-8", "hex");
    encryptedText += cipher.final("hex");
    return encryptedText;
    }
    catch(e){
        console.log(e)
    }
}
export function decryptReq(password:string, encrptedString:string){
     const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, salt);
    let decryptedText = decipher.update(encrptedString, "hex", "utf-8");
    decryptedText += decipher.final("utf-8");
    return decryptedText;
}