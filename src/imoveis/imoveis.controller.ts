import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ImoveisService } from './imoveis.service';
import { CreateImovelDto } from './dto/create-imovel.dto';
import { UpdateImovelDto } from './dto/update-imovel.dto';
import { JwtGuard } from '../common/guards/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@Controller('imoveis')
@UseGuards(JwtGuard)
export class ImoveisController {
  constructor(private readonly imoveisService: ImoveisService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @GetUser('id') userId: number,
    @GetUser('user_type') userType: string,
    @Body() createImovelDto: CreateImovelDto,
  ) {
    const result = await this.imoveisService.create(userId, userType, createImovelDto);
    return ApiResponseDto.success(result, 'Imóvel criado com sucesso');
  }

  @Get()
  async findAll(
    @GetUser('id') userId: number,
    @GetUser('user_type') userType: string,
  ) {
    const result = await this.imoveisService.findAllByUser(userId, userType);
    return ApiResponseDto.success(result, 'Imóveis listados com sucesso');
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
    @GetUser('user_type') userType: string,
  ) {
    const result = await this.imoveisService.findOne(id, userId, userType);
    return ApiResponseDto.success(result, 'Imóvel encontrado com sucesso');
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
    @GetUser('user_type') userType: string,
    @Body() updateImovelDto: UpdateImovelDto,
  ) {
    const result = await this.imoveisService.update(id, userId, userType, updateImovelDto);
    return ApiResponseDto.success(result, 'Imóvel atualizado com sucesso');
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
    @GetUser('user_type') userType: string,
  ) {
    const result = await this.imoveisService.remove(id, userId, userType);
    return ApiResponseDto.success(result, 'Imóvel excluído com sucesso');
  }
} 