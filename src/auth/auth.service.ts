import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserType } from '../common/dto/enums';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Validar confirmação de senha
    if (dto.password !== dto.password_confirmation) {
      throw new BadRequestException('As senhas não coincidem');
    }

    // Verificar se email já existe
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email já está em uso');
    }

    // Verificar se CPF/CNPJ já existe
    const existingCpfCnpj = await this.prisma.user.findUnique({
      where: { cpf_cnpj: dto.cpf_cnpj },
    });
    if (existingCpfCnpj) {
      throw new ConflictException('CPF/CNPJ já está em uso');
    }

    // Verificar se WhatsApp já existe
    const existingWhatsApp = await this.prisma.user.findUnique({
      where: { whatsapp: dto.whatsapp },
    });
    if (existingWhatsApp) {
      throw new ConflictException('WhatsApp já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Preparar dados do usuário
    const userData: any = {
      name: dto.name,
      cpf_cnpj: dto.cpf_cnpj,
      whatsapp: dto.whatsapp,
      email: dto.email,
      password: hashedPassword,
      user_type: dto.user_type,
      data_nascimento: dto.data_nascimento ? new Date(dto.data_nascimento) : null,
      email_pessoal: dto.email_pessoal,
    };

    // Adicionar campos específicos por tipo de usuário
    if (dto.user_type === UserType.SINDICO_RESIDENTE || dto.user_type === UserType.SINDICO_PROFISSIONAL) {
      userData.periodo_mandato_inicio = dto.periodo_mandato_inicio ? new Date(dto.periodo_mandato_inicio) : null;
      userData.periodo_mandato_fim = dto.periodo_mandato_fim ? new Date(dto.periodo_mandato_fim) : null;
      userData.subsindico_info = dto.subsindico_info;
    }

    if (dto.user_type === UserType.ADMIN_IMOVEIS || dto.user_type === UserType.PRESTADOR) {
      userData.nome_fantasia = dto.nome_fantasia;
      userData.razao_social = dto.razao_social;
      userData.responsavel_empresa = dto.responsavel_empresa;
      userData.cep = dto.cep;
      userData.endereco = dto.endereco;
      userData.cidade = dto.cidade;
      userData.uf = dto.uf;
      userData.regime_tributario = dto.regime_tributario;
      
      if (dto.user_type === UserType.PRESTADOR) {
        userData.segmentos_atuacao = dto.segmentos_atuacao || [];
      }
    }

    // Criar usuário
    const user = await this.prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        user_type: true,
        created_at: true,
      },
    });

    // Gerar token
    const token = await this.signToken(user.id, user.email, user.user_type);

    return {
      user,
      token,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar senha
    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar token
    const token = await this.signToken(user.id, user.email, user.user_type);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        created_at: user.created_at,
      },
      token,
    };
  }

  async updatePassword(userId: number, dto: UpdatePasswordDto): Promise<void> {
    // Validar confirmação de senha
    if (dto.new_password !== dto.new_password_confirmation) {
      throw new BadRequestException('As senhas não coincidem');
    }

    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Verificar senha atual
    const passwordMatches = await bcrypt.compare(dto.current_password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(dto.new_password, 12);

    // Atualizar senha
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async checkEmail(email: string): Promise<{ available: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return { available: !user };
  }

  async checkCpfCnpj(cpf_cnpj: string): Promise<{ available: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { cpf_cnpj },
    });

    return { available: !user };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        cpf_cnpj: true,
        whatsapp: true,
        email: true,
        user_type: true,
        data_nascimento: true,
        email_pessoal: true,
        created_at: true,
        updated_at: true,
        periodo_mandato_inicio: true,
        periodo_mandato_fim: true,
        subsindico_info: true,
        nome_fantasia: true,
        razao_social: true,
        responsavel_empresa: true,
        cep: true,
        endereco: true,
        cidade: true,
        uf: true,
        segmentos_atuacao: true,
        regime_tributario: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }

  private async signToken(userId: number, email: string, userType: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
      user_type: userType,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
      secret: this.config.get('JWT_SECRET'),
    });
  }
} 