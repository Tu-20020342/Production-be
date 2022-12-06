import { IsNotEmpty, Length } from 'class-validator';

export class ICategory {
  @Length(3, 100)
  @IsNotEmpty()
  name: string | undefined;
}
