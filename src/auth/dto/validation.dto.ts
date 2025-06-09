import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class CheckEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class CheckCpfCnpjDto {
  @IsString()
  @IsNotEmpty()
  cpf_cnpj: string;
} 