import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsPhoneNumber,
  IsObject,
  MinLength,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
import { UserType, RegimeTributario } from '../../common/dto/enums';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cpf_cnpj: string;

  @IsString()
  @IsNotEmpty()
  whatsapp: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(8)
  password_confirmation: string;

  @IsEnum(UserType)
  user_type: UserType;

  @IsOptional()
  @IsDateString()
  data_nascimento?: string;

  @IsOptional()
  @IsEmail()
  email_pessoal?: string;

  // Campos específicos para síndicos
  @IsOptional()
  @IsDateString()
  periodo_mandato_inicio?: string;

  @IsOptional()
  @IsDateString()
  periodo_mandato_fim?: string;

  @IsOptional()
  @IsObject()
  subsindico_info?: {
    nome: string;
    cpf: string;
    whatsapp: string;
    email: string;
  };

  // Campos específicos para empresas (Admin Imóveis/Prestadores)
  @IsOptional()
  @IsString()
  nome_fantasia?: string;

  @IsOptional()
  @IsString()
  razao_social?: string;

  @IsOptional()
  @IsString()
  responsavel_empresa?: string;

  @IsOptional()
  @IsString()
  cep?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  uf?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  segmentos_atuacao?: string[];

  @IsOptional()
  @IsEnum(RegimeTributario)
  regime_tributario?: RegimeTributario;
} 