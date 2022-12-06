import { Length, IsNotEmpty } from 'class-validator';
import mongoose, { Schema, Types } from 'mongoose';

export class IUserPayload {
  id?: string;

  username?: string | undefined;

  name?: string | undefined;

  divisionId?: mongoose.Types.ObjectId | undefined;
}

export class IAccount {
  @Length(5, 100)
  @IsNotEmpty()
  username: string | undefined;

  @Length(5, 100)
  @IsNotEmpty()
  password?: string | undefined;
}
