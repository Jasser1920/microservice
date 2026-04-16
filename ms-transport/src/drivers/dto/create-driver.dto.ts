import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  fullName!: string;

  @IsString()
  phone!: string;

  @IsString()
  licenseNumber!: string;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
