import { Query } from 'express-serve-static-core';
import { Request } from 'express-serve-static-core';

export interface JwtRequest extends Request {
  user?: {
    id?: string;
    username?: string;
    tier?: number;
    divisionId?: number;
  };
}

export interface TypedRequestQuery<T extends Query> extends Request {
  query: T;
}
