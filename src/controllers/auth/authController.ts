import { Request, Response } from 'express';
import { Account } from '../../models/accountModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { redisClient } from '../../utils/redisConnect';
import { JwtRequest, TypedRequestQuery } from '../../utils/types/customRequest';
import { sendActivateMailToQueue, sendForgotPassMailToQueue } from '../../utils/mailBullRegister';
import { validate } from 'class-validator';
import { IUserPayload } from './dto';
import { IAccount } from './dto';
import { Division } from '../../models/divisionModel';

const checkAccount = (username: string, password: string, res: Response): Promise<boolean> => {
  const account = new IAccount();
  account.username = username;
  account.password = password;
  return new Promise((resolve) => {
    validate(account).then((errors) => {
      if (errors.length) {
        const constraint = { ...errors[0].constraints };
        return res.status(400).send({
          message: Object.values(constraint)[0],
        });
      } else {
        resolve(true);
      }
    });
  });
};

const checkEmail = (username: string, res: Response): Promise<boolean> => {
  const email = new IAccount();
  email.username = username;
  return new Promise((resolve) => {
    validate(email, { skipMissingProperties: true }).then((errors) => {
      if (errors.length) {
        const constraint = { ...errors[0].constraints };
        return res.status(400).send({
          message: Object.values(constraint)[0],
        });
      } else {
        resolve(true);
      }
    });
  });
};

const checkPassword = (password: string, res: Response): Promise<boolean> => {
  const account = new IAccount();
  account.password = password;
  return new Promise((resolve) => {
    validate(account, { skipMissingProperties: true }).then((errors) => {
      if (errors.length) {
        const constraint = { ...errors[0].constraints };
        return res.status(400).send({
          message: Object.values(constraint)[0],
        });
      } else {
        resolve(true);
      }
    });
  });
};

const createAccessToken = (user: IUserPayload) => {
  return jwt.sign(
    { id: user.id, username: user.username, divisionId: user.divisionId },
    String(process.env.ACCESS_TOKEN_PRIVATE_KEY),
    {
      expiresIn: Number(process.env.ACCESS_TOKEN_TTL),
    },
  );
};

const createRefreshToken = (user: IUserPayload) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    String(process.env.REFRESH_TOKEN_PRIVATE_KEY),
    {
      expiresIn: Number(process.env.REFRESH_TOKEN_TTL),
    },
  );
};

const signInAccount = async (user: IUserPayload) => {
  const newAccessToken = createAccessToken(user);
  const client = await redisClient();
  const refreshToken = await client.get(String(user.id));
  if (refreshToken) {
    await client.set(newAccessToken, refreshToken, { EX: Number(process.env.REFRESH_TOKEN_TTL) });
  } else {
    const newRefreshToken = createRefreshToken(user);
    await client.set(String(user.id), newRefreshToken, {
      EX: Number(process.env.REFRESH_TOKEN_TTL),
    });
  }
  return newAccessToken;
};

const signIn = async (req: Request, res: Response) => {
  const username = req.body.username;
  const password = req.body.password;

  await checkAccount(username, password, res);

  const client = await redisClient();

  const account = await Account.findOne({ username: username });
  if (!account) {
    return res.status(401).send({
      message: 'Not found Account',
    });
  }

  bcrypt.compare(password, String(account.password), async (error, result) => {
    if (result) {
      // when login delete the old access token from redis
      if (req.cookies.access_token) {
        await client.del(req.cookies.access_token);
      }
      // generate new access token
      // const accessToken = await signInAccount(account);
      // tao acccess token
      try {
        const division = await Division.findById(account.divisionId);

        if (division) {
          const tier = division.tier;
          const accessToken = jwt.sign(
            {
              username: account.username,
              id: account.id,
              divisionId: account.divisionId,
              tier: tier,
            },
            String(process.env.ACCESS_TOKEN_PRIVATE_KEY),
            {
              expiresIn: Number(process.env.REFRESH_TOKEN_TTL),
            },
          );

          res.cookie('access_token', accessToken, { httpOnly: true });
          return res.status(200).send({
            accessToken: accessToken,
          });
        }
      } catch (err) {
        return res.status(400).send({
          message: 'Can not login ok !',
        });
      }
    } else {
      return res.status(400).send({
        message: 'Incorect password',
      });
    }
  });
};

const signUp = async (req: Request, res: Response) => {
  const { username, password, name, divisionId } = req.body;

  await checkAccount(username, password, res);

  try {
    const existAccount = await Account.findOne({ username: username });
    if (existAccount) {
      return res.status(400).send({
        message: 'Account exist',
      });
    }
    const hashPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS));
    await Account.create({
      username: username,
      password: hashPassword,
      name: name,
      divisionId: divisionId,
    });
  } catch {
    return res.status(400).send({
      message: 'Can not create account',
    });
  }

  return res.status(200).send({
    message: 'Sign up success',
  });
};

const logout = async (req: Request, res: Response) => {
  const client = await redisClient();
  await client.del(req.cookies.access_token);

  res.clearCookie('access_token');
  return res.status(200).send({
    message: 'Logout success',
  });
};

const generateNewAccessToken = async (req: Request, res: Response) => {
  const client = await redisClient();
  if (req.cookies.access_token) {
    const refreshToken = await client.get(req.cookies.access_token);
    if (refreshToken) {
      jwt.verify(
        refreshToken,
        String(process.env.REFRESH_TOKEN_PRIVATE_KEY),
        async (err: any, decoded: any) => {
          if (decoded) {
            const account = {
              id: decoded.id,
              username: decoded.username,
              isActivate: decoded.isActivate,
            };
            // delete the old token
            await client.del(req.cookies.access_token);
            // generate new access token
            const newAccessToken = createAccessToken(account);
            // generate new key-value access-refresh in redis
            await client.set(newAccessToken, refreshToken, {
              EX: Number(process.env.REFRESH_TOKEN_TTL),
            });
            res.cookie('access_token', newAccessToken, { httpOnly: true });
            return res.status(200).send({
              access_token: newAccessToken,
            });
          } else {
            return res.status(400).send({
              message: 'refresh_token time out',
            });
          }
        },
      );
    } else {
      return res.status(500).send({
        message: 'unauthorized',
      });
    }
  } else {
    return res.status(500).send({
      message: 'unauthorized',
    });
  }
};

const sendActivateEmail = async (req: Request, res: Response) => {
  const username = req.body.username;
  await checkEmail(username, res);
  const user = await Account.findOne({ username: username });
  if (user) {
    await sendActivateMailToQueue({ email: username });
    return res.status(200).send({
      message: 'Send activate email',
    });
  } else {
    return res.status(400).send({
      message: 'Email has not been registered yet',
    });
  }
};

const activateAccount = async (
  req: TypedRequestQuery<{ linkType: string; secretKey: string }>,
  res: Response,
) => {
  if (req.query.secretKey && req.query.linkType) {
    const client = await redisClient();
    const secretKey = await client.get(`${process.env.SECRET_KEY_PREFIX}_${req.query.secretKey}`);
    await client.del(`${process.env.SECRET_KEY_PREFIX}_${req.query.secretKey}`);
    if (secretKey) {
      try {
        await Account.findOneAndUpdate({ username: secretKey }, { isActivate: true });
        return res.status(200).send({
          message: 'ok we activate your account',
        });
      } catch (err) {
        return res.status(400).send({
          message: 'can not activate account',
        });
      }
    } else {
      return res.status(400).send({
        message: 'we can not authenticate you',
      });
    }
  } else {
    return res.status(400).send({
      message: 'we can not authenticate you',
    });
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  const username = req.body.username;
  await checkEmail(username, res);
  const user = await Account.findOne({ username: username });
  if (user) {
    await sendForgotPassMailToQueue({ email: username });
    return res.status(200).send({
      message: 'Send forgot password email',
    });
  } else {
    return res.status(400).send({
      message: 'Email has not been register yet',
    });
  }
};

const confirmForgotPassword = async (
  req: TypedRequestQuery<{ linkType: string; secretKey: string }>,
  res: Response,
) => {
  if (req.query.secretKey && req.query.linkType) {
    const client = await redisClient();
    const username = await client.get(`${process.env.SECRET_KEY_PREFIX}_${req.query.secretKey}`);
    await client.del(`${process.env.SECRET_KEY_PREFIX}_${req.query.secretKey}`);
    if (username) {
      try {
        const user = await Account.findOneAndUpdate({ username: username }, { isActivate: true });
        if (user) {
          const accessToken = await signInAccount(user);
          res.cookie('access_token', accessToken, { httpOnly: true });
          return res.status(200).send({
            access_token: accessToken,
          });
        } else {
          return res.status(400).send({
            message: 'Can not get access token',
          });
        }
      } catch (err) {
        return res.status(400).send({
          message: 'can not activate account',
        });
      }
    } else {
      return res.status(400).send({
        message: 'we can not authenticate you',
      });
    }
  } else {
    return res.status(400).send({
      message: 'we can not authenticate you',
    });
  }
};

const resetPassword = async (req: JwtRequest, res: Response) => {
  if (req.user) {
    const password = req.body.password;
    await checkPassword(password, res);
    const hashPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS));
    const user = await Account.findOneAndUpdate({ id: req.user.id }, { password: hashPassword });
    if (user) {
      return res.status(200).send({
        message: 'Reset password completed!',
      });
    } else {
      return res.status(400).send({
        message: 'Can not change password',
      });
    }
  } else {
    return res.status(400).send({
      message: 'Can not change password',
    });
  }
};

export {
  signIn,
  signUp,
  generateNewAccessToken,
  activateAccount,
  sendActivateEmail,
  forgotPassword,
  confirmForgotPassword,
  resetPassword,
  logout,
  signInAccount,
};
