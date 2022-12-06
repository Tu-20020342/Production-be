import { signInAccount } from '../authController';
import { IUserPayload } from '../dto';

const faceBookSignIn = async (req: any, res: any) => {
  const user: IUserPayload = req.user;
  const accessToken = await signInAccount(user);
  res.cookie('access_token', accessToken, { httpOnly: true });
  return res.status(200).send({
    access_token: accessToken,
  });
};

export { faceBookSignIn };
