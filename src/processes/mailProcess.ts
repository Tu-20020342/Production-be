import Queue from 'bull';
import { SendMailOptions, Transporter } from 'nodemailer';
import { redisClient } from '../utils/redisConnect';
import { v4 as uuidv4 } from 'uuid';

export interface ISendMailOptions extends SendMailOptions {
  to?: string;
  from?: string;
  subject?: string;
  text?: string;
  html?: string;
  template?: string;
  context?: {
    [name: string]: any;
  };
}

export const activateMailProcess = async (transporter: Transporter) => {
  const queue = Queue('activateMailQueue');
  const client = await redisClient();
  queue.process(async (job, done) => {
    const secretKey = uuidv4();
    const mailOption: ISendMailOptions = {
      from: String(process.env.MAIL_FROM),
      to: job.data.email,
      subject: 'Welcome new user',
      template: 'welcome-email',
      context: {
        url: `${String(
          process.env.FRONTEND_BASE_URL,
        )}/auth/activate-user?linkType=verify&secretKey=${secretKey}`,
        email: job.data.email,
      },
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(info);
      }
    });

    await client.set(`${String(process.env.SECRET_KEY_PREFIX)}_${secretKey}`, job.data.email, {
      EX: Number(process.env.SECRET_KEY_TTL),
    });
    queue.close();
    done();
  });
};

export const forgotPassMailProcess = async (transporter: Transporter) => {
  const queue = Queue('forgotPassMailQueue');
  const client = await redisClient();
  queue.process(async (job, done) => {
    const secretKey = uuidv4();
    const mailOption: ISendMailOptions = {
      from: String(process.env.MAIL_FROM),
      to: job.data.email,
      subject: 'Forgot password',
      template: 'forgot-pass-email',
      context: {
        url: `${String(
          process.env.FRONTEND_BASE_URL,
        )}/auth/confirm-forgot-password?linkType=forgot-password&secretKey=${secretKey}`,
        email: job.data.email,
      },
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(info);
      }
    });

    await client.set(`${String(process.env.SECRET_KEY_PREFIX)}_${secretKey}`, job.data.email, {
      EX: Number(process.env.SECRET_KEY_TTL),
    });
    queue.close();
    done();
  });
};
