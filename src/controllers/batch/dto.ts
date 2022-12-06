import {
  IsNumber,
  Length,
  Max,
  Min,
  IsNotEmpty,
  IsDateString,
  IsMongoId,
  IsOptional,
} from 'class-validator';

export class IBatch {
  @Length(5, 100)
  @IsNotEmpty()
  batchSeri: string | undefined;

  @IsNotEmpty()
  manufactureDate: string | undefined;

  @IsNumber()
  @Min(1)
  @Max(100000)
  @IsNotEmpty()
  warrantyPeriod: number | undefined;

  @Length(5, 100)
  @IsMongoId()
  @IsNotEmpty()
  divisionId: string | undefined;

  // optional field
  @Length(5, 100)
  @IsOptional()
  note: string | undefined;
}

export class IUpdateBatchPayload {
  @IsNotEmpty()
  @Length(5, 100)
  batchSeri: string | undefined;

  @IsDateString({}, { message: `ManufactureDate must be in 'YYYY-MM-DDTHH:mm:ss.SSSZ' format` })
  @IsNotEmpty()
  manufactureDate: string | undefined;

  @IsNumber()
  @Min(0)
  @Max(120)
  @IsNotEmpty()
  warrantyPeriod: number | undefined;

  @Length(5, 100)
  @IsNotEmpty()
  @IsMongoId()
  divisionId: string | undefined;

  @Length(5, 100)
  note: string | undefined;
}
