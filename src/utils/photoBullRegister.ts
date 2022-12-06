import Queue from 'bull';

const sendProfileImageToQueue = async (fileName: string) => {
  const queue = new Queue('profileImageQueue', {
    redis: String(process.env.REDIS_URL),
    defaultJobOptions: {
      removeOnComplete: true,
    },
  });
  if (fileName) {
    await queue.add(fileName);
  }
};

const sendPostImageToQueue = async (fileName: string) => {
  const queue = new Queue('postImageQueue', {
    redis: String(process.env.REDIS_URL),
    defaultJobOptions: {
      removeOnComplete: true,
    },
  });
  if (fileName) {
    await queue.add(fileName);
  }
};

export { sendPostImageToQueue, sendProfileImageToQueue };
