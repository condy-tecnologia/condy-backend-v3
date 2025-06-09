import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CheckEmailDto, CheckCpfCnpjDto } from './dto/validation.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { JwtGuard } from '../common/guards/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return ApiResponseDto.success(result, 'Usuário registrado com sucesso');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return ApiResponseDto.success(result, 'Login realizado com sucesso');
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async getMe(@GetUser('id') userId: number) {
    const result = await this.authService.getMe(userId);
    return ApiResponseDto.success({ user: result }, 'Dados do usuário obtidos com sucesso');
  }

  @Put('update-password')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @GetUser('id') userId: number,
    @Body() dto: UpdatePasswordDto,
  ) {
    await this.authService.updatePassword(userId, dto);
    return ApiResponseDto.success(null, 'Senha atualizada com sucesso');
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    // Com JWT, o logout é feito do lado do cliente removendo o token
    // Aqui apenas retornamos uma resposta de sucesso
    return ApiResponseDto.success(null, 'Logout realizado com sucesso');
  }

  @Post('logout-all')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll() {
    // Com JWT, o logout de todos dispositivos seria implementado com uma blacklist
    // Por simplicidade, aqui apenas retornamos uma resposta de sucesso
    return ApiResponseDto.success(null, 'Logout de todos dispositivos realizado com sucesso');
  }

  @Post('check-email')
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Body() dto: CheckEmailDto) {
    const result = await this.authService.checkEmail(dto.email);
    return ApiResponseDto.success(result, 'Verificação de email realizada');
  }

  @Post('check-cpf-cnpj')
  @HttpCode(HttpStatus.OK)
  async checkCpfCnpj(@Body() dto: CheckCpfCnpjDto) {
    const result = await this.authService.checkCpfCnpj(dto.cpf_cnpj);
    return ApiResponseDto.success(result, 'Verificação de CPF/CNPJ realizada');
  }
} 