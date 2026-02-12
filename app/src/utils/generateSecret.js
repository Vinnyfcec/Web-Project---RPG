import crypto from 'node:crypto';

const secret = crypto.randomBytes(64).toString('hex');
console.log('--- NOVO SESSION_SECRET GERADO ---');
console.log(secret);
console.log('----------------------------------');
console.log('Copie o código acima e cole no seu arquivo .env');