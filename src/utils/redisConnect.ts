import { createClient } from '@redis/client';

export const redisClient = async () => {
  const redisClient = createClient({
    url: String(process.env.REDIS_URL),
  });
  redisClient.on('error', (error) => console.log(error));
  await redisClient.connect();
  return redisClient;
};
