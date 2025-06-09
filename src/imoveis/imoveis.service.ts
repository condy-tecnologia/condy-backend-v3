import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateImovelDto } from './dto/create-imovel.dto';
import { UpdateImovelDto } from './dto/update-imovel.dto';
import { UserType } from '../common/dto/enums';

@Injectable()
export class ImoveisService {
  constructor(private prisma: PrismaService) {}

  async create(gestorId: number, userType: string, dto: CreateImovelDto) {
    // Verificar se o usuário pode criar imóveis
    if (userType === UserType.PRESTADOR) {
      throw new ForbiddenException('Prestadores não podem criar imóveis');
    }

    // Verificar se CNPJ já existe
    const existingCnpj = await this.prisma.imovel.findUnique({
      where: { cnpj: dto.cnpj },
    });
    if (existingCnpj) {
      throw new ConflictException('CNPJ já está em uso');
    }

    const imovel = await this.prisma.imovel.create({
      data: {
        ...dto,
        gestor_id: gestorId,
        areas_comuns: dto.areas_comuns || [],
      },
      include: {
        gestor: {
          select: {
            id: true,
            name: true,
            email: true,
            user_type: true,
          },
        },
        _count: {
          select: {
            ativos: true,
            chamados: true,
          },
        },
      },
    });

    return imovel;
  }

  async findAllByUser(userId: number, userType: string) {
    // Verificar se o usuário pode ver imóveis
    if (userType === UserType.PRESTADOR) {
      throw new ForbiddenException('Prestadores não podem listar imóveis');
    }

    const imoveis = await this.prisma.imovel.findMany({
      where: {
        gestor_id: userId,
      },
      include: {
        gestor: {
          select: {
            id: true,
            name: true,
            email: true,
            user_type: true,
          },
        },
        _count: {
          select: {
            ativos: true,
            chamados: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return imoveis;
  }

  async findOne(id: number, userId: number, userType: string) {
    // Verificar se o usuário pode ver imóveis
    if (userType === UserType.PRESTADOR) {
      throw new ForbiddenException('Prestadores não podem ver detalhes de imóveis');
    }

    const imovel = await this.prisma.imovel.findUnique({
      where: { id },
      include: {
        gestor: {
          select: {
            id: true,
            name: true,
            email: true,
            user_type: true,
          },
        },
        ativos: {
          select: {
            id: true,
            asset_code: true,
            descricao_ativo: true,
            local_instalacao: true,
            created_at: true,
          },
          orderBy: {
            asset_code: 'asc',
          },
        },
        chamados: {
          select: {
            id: true,
            numero_chamado: true,
            descricao_ocorrido: true,
            status: true,
            prioridade: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 10, // Últimos 10 chamados
        },
        _count: {
          select: {
            ativos: true,
            chamados: true,
          },
        },
      },
    });

    if (!imovel) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    // Verificar se o usuário é o gestor do imóvel
    if (imovel.gestor_id !== userId) {
      throw new ForbiddenException('Você não tem permissão para ver este imóvel');
    }

    return imovel;
  }

  async update(id: number, userId: number, userType: string, dto: UpdateImovelDto) {
    // Verificar se o usuário pode atualizar imóveis
    if (userType === UserType.PRESTADOR) {
      throw new ForbiddenException('Prestadores não podem atualizar imóveis');
    }

    // Buscar o imóvel
    const imovel = await this.prisma.imovel.findUnique({
      where: { id },
    });

    if (!imovel) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    // Verificar se o usuário é o gestor do imóvel
    if (imovel.gestor_id !== userId) {
      throw new ForbiddenException('Você não tem permissão para atualizar este imóvel');
    }

    // Verificar se CNPJ já existe (se estiver sendo alterado)
    if (dto.cnpj && dto.cnpj !== imovel.cnpj) {
      const existingCnpj = await this.prisma.imovel.findUnique({
        where: { cnpj: dto.cnpj },
      });
      if (existingCnpj) {
        throw new ConflictException('CNPJ já está em uso');
      }
    }

    const updatedImovel = await this.prisma.imovel.update({
      where: { id },
      data: dto,
      include: {
        gestor: {
          select: {
            id: true,
            name: true,
            email: true,
            user_type: true,
          },
        },
        _count: {
          select: {
            ativos: true,
            chamados: true,
          },
        },
      },
    });

    return updatedImovel;
  }

  async remove(id: number, userId: number, userType: string) {
    // Verificar se o usuário pode excluir imóveis
    if (userType === UserType.PRESTADOR) {
      throw new ForbiddenException('Prestadores não podem excluir imóveis');
    }

    // Buscar o imóvel
    const imovel = await this.prisma.imovel.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            ativos: true,
            chamados: true,
          },
        },
      },
    });

    if (!imovel) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    // Verificar se o usuário é o gestor do imóvel
    if (imovel.gestor_id !== userId) {
      throw new ForbiddenException('Você não tem permissão para excluir este imóvel');
    }

    // Verificar se há ativos ou chamados vinculados
    if (imovel._count.ativos > 0 || imovel._count.chamados > 0) {
      throw new ConflictException(
        'Não é possível excluir imóvel com ativos ou chamados vinculados'
      );
    }

    await this.prisma.imovel.delete({
      where: { id },
    });

    return { message: 'Imóvel excluído com sucesso' };
  }
} 