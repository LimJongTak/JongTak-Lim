import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync('./server/service-account.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const posts = await db.collection('posts').get();
posts.forEach(d => {
  const data = d.data();
  console.log('POST', d.id, '|', data.slug || '(no slug)', '|', (data.title||'').slice(0, 40));
});

const projects = await db.collection('projects').get();
projects.forEach(d => {
  const data = d.data();
  console.log('PROJ', d.id, '|', data.slug || '', '|', 'featured:', data.featured, '|', (data.title||'').slice(0, 40));
});

process.exit(0);
