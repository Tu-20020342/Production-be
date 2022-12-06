import Queue from 'bull';

interface Imail {
  email: string;
}

const sendActivateMailToQueue = async (email: Imail) => {
  const queue = new Queue('activateMailQueue', {
    redis: String(process.env.REDIS_URL),
    defaultJobOptions: {
      removeOnComplete: true,
    },
  });
  if (email) {
    await queue.add(email);
  }
};

const sendForgotPassMailToQueue = async (email: Imail) => {
  const queue = new Queue('forgotPassMailQueue', {
    redis: String(process.env.REDIS_URL),
    defaultJobOptions: {
      removeOnComplete: true,
    },
  });
  if (email) {
    await queue.add(email);
  }
};

export { sendActivateMailToQueue, sendForgotPassMailToQueue };
