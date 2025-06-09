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
import { AtivosService } from './ativos.service';
import { CreateAtivoDto } from './dto/create-ativo.dto';
import { UpdateAtivoDto } from './dto/update-ativo.dto';
import { JwtGuard } from '../common/guards/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@Controller('imoveis/:imovelId/ativos')
@UseGuards(JwtGuard)
export class AtivosController {
  constructor(private readonly ativosService: AtivosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('imovelId', ParseIntPipe) imovelId: number,
    @GetUser('id') userId: number,
    @GetUser('user_type') userType: string,
    @Body() createAtivoDto: CreateAtivoDto,
  ) {
    const result = await this.ativosService.create(imovelId, userId, userType, createAtivoDto);
    return ApiResponseDto.success(result, 'Ativo criado com sucesso');
  }

  @Get()
  async findAll(
    @Param('imovelId', ParseIntPipe) imovelId: number,
    @GetUser('id') userId: number,
    @GetUser('user_type') userType: string,
  ) {
    const result = await this.ativosService.findAllByImovel(imovelId, userId, userType);
    return ApiResponseDto.success(result, 'Ativos listados com sucesso');
  }

  @Get(':id')
  async findOne(
    @Param('imovelId', ParseIntPipe) imovelId: number,
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
    @GetUser('user_type') userType: string,
  ) {
    const result = await this.ativosService.findOne(imovelId, id, userId, userType);
    return ApiResponseDto.success(result, 'Ativo encontrado com sucesso');
  }

  @Patch(':id')
  async update(
    @Param('imovelId', ParseIntPipe) imovelId: number,
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
    @GetUser('user_type') userType: string,
    @Body() updateAtivoDto: UpdateAtivoDto,
  ) {
    const result = await this.ativosService.update(imovelId, id, userId, userType, updateAtivoDto);
    return ApiResponseDto.success(result, 'Ativo atualizado com sucesso');
  }

  @Delete(':id')
  async remove(
    @Param('imovelId', ParseIntPipe) imovelId: number,
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
    @GetUser('user_type') userType: string,
  ) {
    const result = await this.ativosService.remove(imovelId, id, userId, userType);
    return ApiResponseDto.success(result, 'Ativo excluído com sucesso');
  }
} 