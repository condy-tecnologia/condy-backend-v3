import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateAtivoDto } from './dto/create-ativo.dto';
import { UpdateAtivoDto } from './dto/update-ativo.dto';
import { UserType } from '../common/dto/enums';

@Injectable()
export class AtivosService {
  constructor(private prisma: PrismaService) {}

  private async generateAssetCode(): Promise<string> {
    // Buscar o último código de ativo criado
    const lastAsset = await this.prisma.ativo.findFirst({
      orderBy: {
        asset_code: 'desc',
      },
      select: {
        asset_code: true,
      },
    });

    if (!lastAsset) {
      return '00001';
    }

    // Extrair o número do código e incrementar
    const lastNumber = parseInt(lastAsset.asset_code);
    const nextNumber = lastNumber + 1;
    
    // Formatar com zeros à esquerda (5 dígitos)
    return nextNumber.toString().padStart(5, '0');
  }

  private async createDefaultAssets(imovelId: number): Promise<void> {
    const defaultAssets = [
      {
        descricao_ativo: 'Sistema Elétrico',
        local_instalacao: 'Áreas Comuns',
        asset_code: await this.generateAssetCode(),
      },
      {
        descricao_ativo: 'Sistema Hidráulico',
        local_instalacao: 'Áreas Comuns',
        asset_code: await this.generateAssetCode(),
      },
      {
        descricao_ativo: 'Estrutura Civil',
        local_instalacao: 'Geral',
        asset_code: await this.generateAssetCode(),
      },
    ];

    for (const asset of defaultAssets) {
      await this.prisma.ativo.create({
        data: {
          ...asset,
          imovel_id: imovelId,
          garantia: false,
          contrato_manutencao: false,
          relatorio_fotografico_urls: [],
        },
      });
    }
  }

  async create(imovelId: number, userId: number, userType: string, dto: CreateAtivoDto) {
    // Verificar se o usuário pode criar ativos
    if (userType === UserType.PRESTADOR) {
      throw new ForbiddenException('Prestadores não podem criar ativos');
    }

    // Verificar se o imóvel existe e se o usuário é o gestor
    const imovel = await this.prisma.imovel.findUnique({
      where: { id: imovelId },
    });

    if (!imovel) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    if (imovel.gestor_id !== userId) {
      throw new ForbiddenException('Você não tem permissão para criar ativos neste imóvel');
    }

    // Verificar se é o primeiro ativo do imóvel
    const ativosCount = await this.prisma.ativo.count({
      where: { imovel_id: imovelId },
    });

    // Se for o primeiro ativo, criar os 3 ativos padrão primeiro
    if (ativosCount === 0) {
      await this.createDefaultAssets(imovelId);
    }

    // Gerar código único para o novo ativo
    const assetCode = await this.generateAssetCode();

    // Preparar dados do ativo
    const ativoData: any = {
      ...dto,
      asset_code: assetCode,
      imovel_id: imovelId,
      garantia: dto.garantia || false,
      contrato_manutencao: dto.contrato_manutencao || false,
      relatorio_fotografico_urls: dto.relatorio_fotografico_urls || [],
    };

    // Converter datas se fornecidas
    if (dto.data_instalacao) {
      ativoData.data_instalacao = new Date(dto.data_instalacao);
    }
    if (dto.garantia_validade) {
      ativoData.garantia_validade = new Date(dto.garantia_validade);
    }
    if (dto.contrato_validade) {
      ativoData.contrato_validade = new Date(dto.contrato_validade);
    }

    const ativo = await this.prisma.ativo.create({
      data: ativoData,
      include: {
        imovel: {
          select: {
            id: true,
            nome_fantasia: true,
            cidade: true,
          },
        },
        _count: {
          select: {
            chamados: true,
          },
        },
      },
    });

    return ativo;
  }

  async findAllByImovel(imovelId: number, userId: number, userType: string) {
    // Verificar se o usuário pode ver ativos
    if (userType === UserType.PRESTADOR) {
      throw new ForbiddenException('Prestadores não podem listar ativos');
    }

    // Verificar se o imóvel existe e se o usuário é o gestor
    const imovel = await this.prisma.imovel.findUnique({
      where: { id: imovelId },
    });

    if (!imovel) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    if (imovel.gestor_id !== userId) {
      throw new ForbiddenException('Você não tem permissão para ver ativos deste imóvel');
    }

    const ativos = await this.prisma.ativo.findMany({
      where: {
        imovel_id: imovelId,
      },
      include: {
        imovel: {
          select: {
            id: true,
            nome_fantasia: true,
            cidade: true,
          },
        },
        _count: {
          select: {
            chamados: true,
          },
        },
      },
      orderBy: {
        asset_code: 'asc',
      },
    });

    return ativos;
  }

  async findOne(imovelId: number, ativoId: number, userId: number, userType: string) {
    // Verificar se o usuário pode ver ativos
    if (userType === UserType.PRESTADOR) {
      throw new ForbiddenException('Prestadores não podem ver detalhes de ativos');
    }

    // Verificar se o imóvel existe e se o usuário é o gestor
    const imovel = await this.prisma.imovel.findUnique({
      where: { id: imovelId },
    });

    if (!imovel) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    if (imovel.gestor_id !== userId) {
      throw new ForbiddenException('Você não tem permissão para ver ativos deste imóvel');
    }

    const ativo = await this.prisma.ativo.findUnique({
      where: {
        id: ativoId,
        imovel_id: imovelId,
      },
      include: {
        imovel: {
          select: {
            id: true,
            nome_fantasia: true,
            cidade: true,
            gestor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
            chamados: true,
          },
        },
      },
    });

    if (!ativo) {
      throw new NotFoundException('Ativo não encontrado');
    }

    return ativo;
  }

  async update(imovelId: number, ativoId: number, userId: number, userType: string, dto: UpdateAtivoDto) {
    // Verificar se o usuário pode atualizar ativos
    if (userType === UserType.PRESTADOR) {
      throw new ForbiddenException('Prestadores não podem atualizar ativos');
    }

    // Verificar se o imóvel existe e se o usuário é o gestor
    const imovel = await this.prisma.imovel.findUnique({
      where: { id: imovelId },
    });

    if (!imovel) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    if (imovel.gestor_id !== userId) {
      throw new ForbiddenException('Você não tem permissão para atualizar ativos deste imóvel');
    }

    // Verificar se o ativo existe e pertence ao imóvel
    const ativo = await this.prisma.ativo.findUnique({
      where: {
        id: ativoId,
        imovel_id: imovelId,
      },
    });

    if (!ativo) {
      throw new NotFoundException('Ativo não encontrado');
    }

    // Preparar dados para atualização
    const updateData: any = { ...dto };

    // Converter datas se fornecidas
    if (dto.data_instalacao) {
      updateData.data_instalacao = new Date(dto.data_instalacao);
    }
    if (dto.garantia_validade) {
      updateData.garantia_validade = new Date(dto.garantia_validade);
    }
    if (dto.contrato_validade) {
      updateData.contrato_validade = new Date(dto.contrato_validade);
    }

    const updatedAtivo = await this.prisma.ativo.update({
      where: { id: ativoId },
      data: updateData,
      include: {
        imovel: {
          select: {
            id: true,
            nome_fantasia: true,
            cidade: true,
          },
        },
        _count: {
          select: {
            chamados: true,
          },
        },
      },
    });

    return updatedAtivo;
  }

  async remove(imovelId: number, ativoId: number, userId: number, userType: string) {
    // Verificar se o usuário pode excluir ativos
    if (userType === UserType.PRESTADOR) {
      throw new ForbiddenException('Prestadores não podem excluir ativos');
    }

    // Verificar se o imóvel existe e se o usuário é o gestor
    const imovel = await this.prisma.imovel.findUnique({
      where: { id: imovelId },
    });

    if (!imovel) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    if (imovel.gestor_id !== userId) {
      throw new ForbiddenException('Você não tem permissão para excluir ativos deste imóvel');
    }

    // Verificar se o ativo existe e pertence ao imóvel
    const ativo = await this.prisma.ativo.findUnique({
      where: {
        id: ativoId,
        imovel_id: imovelId,
      },
      include: {
        _count: {
          select: {
            chamados: true,
          },
        },
      },
    });

    if (!ativo) {
      throw new NotFoundException('Ativo não encontrado');
    }

    // Verificar se há chamados vinculados
    if (ativo._count.chamados > 0) {
      throw new ForbiddenException(
        'Não é possível excluir ativo com chamados vinculados'
      );
    }

    await this.prisma.ativo.delete({
      where: { id: ativoId },
    });

    return { message: 'Ativo excluído com sucesso' };
  }
} 