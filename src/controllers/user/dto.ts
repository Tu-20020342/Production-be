import { Length, IsNotEmpty } from 'class-validator';

export class IUser {
  @Length(3, 100)
  @IsNotEmpty()
  username: string | undefined;

  @Length(3, 100)
  @IsNotEmpty()
  password: string | undefined;

  @Length(3, 100)
  name: string | undefined;

  @IsNotEmpty()
  divisionId: string | undefined;
}

export class IUserUpdatePayload {
  @Length(3, 100)
  @IsNotEmpty()
  password: string | undefined;

  @Length(3, 100)
  name: string | undefined;

  @IsNotEmpty()
  divisionId: string | undefined;
}
