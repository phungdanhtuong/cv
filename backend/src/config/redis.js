import { createClient } from 'redis';
import { config } from './env.js';

const client = createClient({
  url: config.redis.url,
});

client.on('error', (err) => console.log('Redis Client Error', err));

await client.connect();

export default client;
