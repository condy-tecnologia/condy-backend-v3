import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsObject,
  IsArray,
  IsUrl,
} from 'class-validator';

export class CreateAtivoDto {
  @IsString()
  @IsNotEmpty()
  descricao_ativo: string;

  @IsString()
  @IsNotEmpty()
  local_instalacao: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsDateString()
  data_instalacao?: string;

  @IsOptional()
  @IsNumber()
  valor_compra?: number;

  @IsOptional()
  @IsBoolean()
  garantia?: boolean;

  @IsOptional()
  @IsDateString()
  garantia_validade?: string;

  @IsOptional()
  @IsObject()
  garantia_fornecedor_info?: {
    nome: string;
    cnpj: string;
    contato: string;
  };

  @IsOptional()
  @IsBoolean()
  contrato_manutencao?: boolean;

  @IsOptional()
  @IsDateString()
  contrato_validade?: string;

  @IsOptional()
  @IsObject()
  contrato_fornecedor_info?: {
    empresa: string;
    valor_mensal: number;
  };

  @IsOptional()
  @IsArray()
  @IsUrl(undefined, { each: true })
  relatorio_fotografico_urls?: string[];
} 