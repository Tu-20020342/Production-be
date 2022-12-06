import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, Length, Max, Min } from 'class-validator';

export class IFile {
  @IsOptional()
  fileName: string | undefined;

  @IsMongoId()
  @IsOptional()
  fileKey: string | undefined;
}

export class Iproduct {
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string | undefined;

  @IsMongoId()
  @IsNotEmpty()
  batchId: string | undefined;

  @IsMongoId()
  @IsNotEmpty()
  divisionId: string | undefined;

  @IsOptional()
  @Length(5, 100)
  note: string | undefined;

  @IsOptional()
  productImage: IFile | undefined;
}

export class IUpdateProduct {
  @IsMongoId()
  @IsOptional()
  categoryId: string | undefined;

  @IsMongoId()
  @IsOptional()
  batchId: string | undefined;

  @IsOptional()
  @Length(0, 100)
  note: string | undefined;

  @IsOptional()
  productImage: IFile | undefined;
}

export class IUpdateState2Payload {
  @IsMongoId()
  @IsNotEmpty()
  sellerId: string | undefined;
}

export class IUpdateState4Payload {
  @Length(5, 100)
  @IsNotEmpty()
  customerName: string | undefined;

  @Length(5, 100)
  @IsNotEmpty()
  customerAddress: string | undefined;
}

export class IUpdateState5PayLoad {
  @Length(5, 100)
  @IsNotEmpty()
  defectiveDetail: string | undefined;
}

export class IUpdateState6Payload {
  @IsMongoId()
  @IsNotEmpty()
  insurrancerId: string | undefined;
}

export class IUpdateStateParam {
  @IsMongoId()
  @IsNotEmpty()
  productId: string | undefined;
}

export class IProductState {
  @Max(13)
  @Min(1)
  @IsNotEmpty()
  state: number | undefined;
}

export class IPeriodPayload {
  @IsOptional()
  month: number | undefined;

  @IsOptional()
  quater: number | undefined;

  @IsOptional()
  year: number | undefined;
}
