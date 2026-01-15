import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
const { encodeBase64, decodeBase64, encodeUTF8 } = naclUtil;

// Generate a new keypair for authority (run once and save to env)
function generateAuthorityKeypair() {
  const keypair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(keypair.publicKey),
    secretKey: encodeBase64(keypair.secretKey)
  };
}

// Decrypt a report using authority's private key
function decryptReport(encryptedPayload, authoritySecretKeyBase64) {
  try {
    const { ciphertext, encryptedKey, ephemeralPublicKey, nonce } = encryptedPayload.report || encryptedPayload;
    
    // Decode all base64 values
    const ciphertextBytes = decodeBase64(ciphertext);
    const encryptedKeyBytes = decodeBase64(encryptedKey);
    const ephemeralPubKeyBytes = decodeBase64(ephemeralPublicKey);
    const nonceBytes = decodeBase64(nonce);
    const authoritySecretKey = decodeBase64(authoritySecretKeyBase64);
    
    // Decrypt the symmetric key using authority's private key
    const symmetricKey = nacl.box.open(
      encryptedKeyBytes,
      nonceBytes,
      ephemeralPubKeyBytes,
      authoritySecretKey
    );
    
    if (!symmetricKey) {
      throw new Error('Failed to decrypt symmetric key');
    }
    
    // Decrypt the message using symmetric key
    const decryptedBytes = nacl.secretbox.open(ciphertextBytes, nonceBytes, symmetricKey);
    
    if (!decryptedBytes) {
      throw new Error('Failed to decrypt message');
    }
    
    return encodeUTF8(decryptedBytes);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed: ' + error.message);
  }
}

// Decrypt a file using authority's private key
function decryptFile(encryptedFile, authoritySecretKeyBase64) {
  try {
    const { ciphertext, encryptedKey, ephemeralPublicKey, nonce, filename, type } = encryptedFile;
    
    if (!ciphertext || !encryptedKey || !ephemeralPublicKey || !nonce) {
      throw new Error('Missing required encryption fields');
    }
    
    // Decode all base64 values
    const ciphertextBytes = decodeBase64(ciphertext);
    const encryptedKeyBytes = decodeBase64(encryptedKey);
    const ephemeralPubKeyBytes = decodeBase64(ephemeralPublicKey);
    const nonceBytes = decodeBase64(nonce);
    const authoritySecretKey = decodeBase64(authoritySecretKeyBase64);
    
    // Decrypt the symmetric key using authority's private key
    const symmetricKey = nacl.box.open(
      encryptedKeyBytes,
      nonceBytes,
      ephemeralPubKeyBytes,
      authoritySecretKey
    );
    
    if (!symmetricKey) {
      throw new Error('Failed to decrypt symmetric key');
    }
    
    // Decrypt the file data using symmetric key
    const decryptedBytes = nacl.secretbox.open(ciphertextBytes, nonceBytes, symmetricKey);
    
    if (!decryptedBytes) {
      throw new Error('Failed to decrypt file');
    }
    
    // Return decrypted file as base64 data URL for easy viewing
    const base64Data = encodeBase64(decryptedBytes);
    const dataUrl = `data:${type || 'application/octet-stream'};base64,${base64Data}`;
    
    return {
      filename: filename || 'decrypted-file',
      type: type || 'application/octet-stream',
      data: decryptedBytes,
      dataUrl: dataUrl,
      size: decryptedBytes.length
    };
  } catch (error) {
    console.error('File decryption error:', error);
    throw new Error('File decryption failed: ' + error.message);
  }
}

export {
  generateAuthorityKeypair,
  decryptReport,
  decryptFile
};
