import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JwtRequest } from '../utils/types/customRequest';

const verifyUser = (req: JwtRequest, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.access_token;
  if (accessToken) {
    jwt.verify(
      accessToken,
      String(process.env.ACCESS_TOKEN_PRIVATE_KEY),
      (err: any, decoded: any) => {
        if (decoded) {
          req.user = {
            username: decoded.username,
            id: decoded.id,
            divisionId: decoded.divisionId,
            tier: decoded.tier,
          };
          next();
        } else {
          return res.status(403).send({
            message: 'Unauthorize',
          });
        }
      },
    );
  } else {
    return res.status(403).send({
      message: 'Unauthorize',
    });
  }
};

const checkAdmin = (req: JwtRequest, res: Response, next: NextFunction) => {
  if (req.user?.tier === 1) {
    next();
  } else {
    res.status(400).send({
      message: 'You are not admin',
    });
  }
};

const checkMalnufacturer = (req: JwtRequest, res: Response, next: NextFunction) => {
  if (req.user?.tier === 2) {
    next();
  } else {
    res.status(400).send({
      message: 'You are not manufacturer',
    });
  }
};

const checkSeller = (req: JwtRequest, res: Response, next: NextFunction) => {
  if (req.user?.tier === 3) {
    next();
  } else {
    res.status(400).send({
      message: 'You are not seller',
    });
  }
};

const checkInsurancer = (req: JwtRequest, res: Response, next: NextFunction) => {
  if (req.user?.tier === 4) {
    next();
  } else {
    res.status(400).send({
      message: 'You are not insurrancer',
    });
  }
};

export { verifyUser, checkAdmin, checkSeller, checkMalnufacturer, checkInsurancer };
