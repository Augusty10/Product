import CryptoJS from 'crypto-js';

export const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

export const decryptData = (encryptedData: string, key: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) throw new Error('Invalid key or corrupted data');
    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed. Please check your password.');
  }
};

export const hashKey = (key: string): string => {
  return CryptoJS.SHA256(key).toString();
};
