import { IsNotEmpty, Max, Min, Length } from 'class-validator';

export class IDivision {
  @Min(1)
  @Max(4)
  @IsNotEmpty()
  tier: number | undefined;

  @Length(3, 100)
  @IsNotEmpty()
  tierName: string | undefined;

  @Length(3, 100)
  @IsNotEmpty()
  address: string | undefined;
}

export class IDivisionListParams {
  search: string | undefined;

  page: number | undefined;

  limit: number | undefined;
}
