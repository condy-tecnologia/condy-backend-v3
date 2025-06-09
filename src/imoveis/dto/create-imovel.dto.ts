import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsUrl,
  Length,
} from 'class-validator';
import { RegimeTributario } from '../../common/dto/enums';

export class CreateImovelDto {
  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @IsString()
  @IsNotEmpty()
  nome_fantasia: string;

  @IsString()
  @IsNotEmpty()
  razao_social: string;

  @IsString()
  @IsNotEmpty()
  cep: string;

  @IsString()
  @IsNotEmpty()
  endereco: string;

  @IsString()
  @IsNotEmpty()
  cidade: string;

  @IsString()
  @Length(2, 2)
  uf: string;

  @IsOptional()
  @IsEnum(RegimeTributario)
  regime_tributario?: RegimeTributario;

  @IsNumber()
  quantidade_moradias: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  areas_comuns?: string[];

  @IsOptional()
  @IsUrl()
  estatuto_url?: string;
} 