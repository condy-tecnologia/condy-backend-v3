# Condy Backend v3 - NestJS

Backend da plataforma Condy para gestão de imóveis, abertura de chamados e administração. Desenvolvido com NestJS, TypeScript, Prisma e JWT.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem de programação
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **class-validator** - Validação de dados

## 📋 Funcionalidades Implementadas

### ✅ Autenticação Completa
- Registro de usuários (5 tipos diferentes)
- Login com JWT
- Atualização de senha
- Validação de email/CPF/CNPJ únicos
- Logout (simples e de todos dispositivos)

### ✅ Gestão de Imóveis
- CRUD completo de imóveis
- Validação de CNPJ único
- Associação ao gestor (síndico/administradora)
- Controle de permissões por tipo de usuário

### ✅ Gestão de Ativos
- CRUD completo de ativos
- **Códigos únicos automáticos** (00001, 00002, etc.)
- **Criação automática de 3 ativos padrão** no primeiro ativo
- Informações de garantia e manutenção
- Relatório fotográfico

### 🔧 Tipos de Usuário Suportados
- `SINDICO_RESIDENTE` - Síndicos residentes
- `SINDICO_PROFISSIONAL` - Síndicos profissionais
- `ADMIN_IMOVEIS` - Administradoras de imóveis
- `PRESTADOR` - Prestadores de serviços
- `ADMIN_PLATAFORMA` - Administradores da plataforma

## ⚙️ Configuração

### 1. Instalar dependências
```bash
yarn install
```

### 2. Configurar banco de dados
Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/condy_backend_v3?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# App
NODE_ENV="development"
PORT=3000
```

### 3. Executar migrações do Prisma
```bash
# Aplicar migrações
npx prisma migrate dev --name init

# Gerar client do Prisma
npx prisma generate
```

### 4. Iniciar aplicação
```bash
# Desenvolvimento
yarn start:dev

# Produção
yarn build
yarn start:prod
```

A aplicação estará disponível em: `http://localhost:3000/api`

## 📚 Endpoints da API

### 🔐 Autenticação (`/api/auth`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/register` | Registrar usuário |
| `POST` | `/login` | Fazer login |
| `GET` | `/me` | Dados do usuário atual |
| `PUT` | `/update-password` | Atualizar senha |
| `POST` | `/logout` | Logout simples |
| `POST` | `/logout-all` | Logout todos dispositivos |
| `POST` | `/check-email` | Verificar se email existe |
| `POST` | `/check-cpf-cnpj` | Verificar se CPF/CNPJ existe |

### 🏠 Imóveis (`/api/imoveis`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | Listar imóveis do usuário |
| `POST` | `/` | Criar novo imóvel |
| `GET` | `/:id` | Detalhes do imóvel |
| `PATCH` | `/:id` | Atualizar imóvel |
| `DELETE` | `/:id` | Excluir imóvel |

### 🔧 Ativos (`/api/imoveis/:imovelId/ativos`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | Listar ativos do imóvel |
| `POST` | `/` | Criar novo ativo |
| `GET` | `/:id` | Detalhes do ativo |
| `PATCH` | `/:id` | Atualizar ativo |
| `DELETE` | `/:id` | Excluir ativo |

### 🔍 Sistema (`/api`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/up` | Health check |

## 🧪 Testando a API

### 1. Registrar um usuário síndico
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "cpf_cnpj": "12345678901",
    "whatsapp": "+5511987654321",
    "email": "joao@teste.com",
    "password": "senha123",
    "password_confirmation": "senha123",
    "user_type": "SINDICO_RESIDENTE",
    "data_nascimento": "1975-05-15"
  }'
```

### 2. Fazer login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@teste.com",
    "password": "senha123"
  }'
```

### 3. Criar um imóvel (usar o token do login)
```bash
curl -X POST http://localhost:3000/api/imoveis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "cnpj": "44444444000144",
    "nome_fantasia": "Condomínio Teste",
    "razao_social": "Condomínio Residencial Teste",
    "cep": "01234-567",
    "endereco": "Rua de Teste, 999",
    "cidade": "São Paulo",
    "uf": "SP",
    "quantidade_moradias": 30
  }'
```

### 4. Criar um ativo (usar ID do imóvel criado)
```bash
curl -X POST http://localhost:3000/api/imoveis/1/ativos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "descricao_ativo": "Portão Automático",
    "local_instalacao": "Entrada Principal",
    "marca": "Portec",
    "modelo": "PT-2000"
  }'
```

## 🎯 Funcionalidades Especiais

### Códigos Únicos de Ativos
- Cada ativo recebe um código único global (00001, 00002, etc.)
- Códigos são gerados automaticamente e incrementais

### Ativos Padrão
Quando o primeiro ativo é criado em um imóvel, o sistema cria automaticamente 3 ativos padrão:
1. **Sistema Elétrico** - Áreas Comuns
2. **Sistema Hidráulico** - Áreas Comuns  
3. **Estrutura Civil** - Geral

### Controle de Permissões
- **Prestadores**: Não podem criar/ver imóveis ou ativos
- **Síndicos/Admins**: Podem gerenciar apenas seus próprios imóveis
- **Admin Plataforma**: Acesso total (futuro)

## 🛡️ Segurança

- Senhas hasheadas com bcrypt (salt 12)
- JWT com expiração configurável
- Validação rigorosa de dados de entrada
- Controle de permissões por tipo de usuário
- Validação de unicidade (email, CPF/CNPJ, WhatsApp)

## 📊 Banco de Dados

O banco de dados foi modelado com Prisma e inclui:

- **Users**: Usuários de diferentes tipos
- **Imoveis**: Imóveis gerenciados
- **Ativos**: Ativos dos imóveis
- **Chamados**: Sistema de chamados (estrutura pronta)

Para visualizar o banco:
```bash
npx prisma studio
```

## 🚀 Deploy

### Usando Docker (recomendado)
```dockerfile
# Dockerfile de exemplo
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start:prod"]
```

### Usando PM2
```bash
# Instalar PM2
npm install -g pm2

# Build da aplicação
yarn build

# Iniciar com PM2
pm2 start dist/main.js --name "condy-backend"
```

## 📝 Próximos Passos

Para completar o MVP baseado no Postman collection, faltam:

1. **Sistema de Chamados** (estrutura já criada)
2. **Rastreamento Público** de chamados
3. **Painel Administrativo** para ADMIN_PLATAFORMA
4. **Relatórios e Dashboard**

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
