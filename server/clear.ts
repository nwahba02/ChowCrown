import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function clear() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const collections = ['competitions', 'restaurants', 'tokens', 'votes'];

  for (const name of collections) {
    const result = await db.collection(name).deleteMany({});
    console.log(`Cleared ${name}: ${result.deletedCount} documents deleted`);
  }

  await client.close();
  console.log('\nDone. Database is empty.');
  process.exit(0);
}

clear().catch((err) => {
  console.error(err);
  process.exit(1);
});
