import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  plateNumber!: string;

  @IsString()
  model!: string;

  @IsString()
  type!: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
