import crypto from 'crypto';

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-pw.mjs <password>');
  process.exit(1);
}

const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 32);
console.log(`${salt.toString('hex')}:${hash.toString('hex')}`);
