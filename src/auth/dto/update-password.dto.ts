import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  current_password: string;

  @IsString()
  @MinLength(8)
  new_password: string;

  @IsString()
  @MinLength(8)
  new_password_confirmation: string;
} 