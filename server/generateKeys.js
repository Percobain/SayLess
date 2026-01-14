// Run this script to generate authority keypair
// node generateKeys.js

const nacl = require('tweetnacl');
const { encodeBase64 } = require('tweetnacl-util');

const keypair = nacl.box.keyPair();

console.log('\n========================================');
console.log('AUTHORITY KEYPAIR GENERATED');
console.log('========================================\n');

console.log('PUBLIC KEY (add to client .env as VITE_AUTHORITY_PUBLIC_KEY):');
console.log(encodeBase64(keypair.publicKey));

console.log('\nPRIVATE KEY (add to server .env as AUTHORITY_PRIVATE_KEY):');
console.log(encodeBase64(keypair.secretKey));

console.log('\n========================================');
console.log('Keep the private key secret!');
console.log('========================================\n');


