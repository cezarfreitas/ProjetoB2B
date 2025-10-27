#!/bin/bash

echo "🚀 Iniciando deploy do B2B Tropical..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null
then
    echo -e "${RED}❌ Docker não está instalado. Por favor, instale o Docker primeiro.${NC}"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null
then
    echo -e "${RED}❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro.${NC}"
    exit 1
fi

# Verificar se .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Criando a partir de .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Por favor, configure as variáveis de ambiente no arquivo .env${NC}"
        nano .env
    else
        echo -e "${RED}❌ Arquivo .env.example não encontrado.${NC}"
        exit 1
    fi
fi

# Parar containers existentes
echo -e "${YELLOW}🛑 Parando containers existentes...${NC}"
docker-compose down

# Limpar imagens antigas (opcional)
echo -e "${YELLOW}🧹 Limpando imagens antigas...${NC}"
docker image prune -f

# Build e start dos containers
echo -e "${GREEN}🔨 Construindo e iniciando containers...${NC}"
docker-compose up -d --build

# Aguardar container iniciar
echo -e "${YELLOW}⏳ Aguardando container inicializar...${NC}"
sleep 10

# Verificar se container está rodando
if docker ps | grep -q b2b-tropical; then
    echo -e "${GREEN}✅ Container iniciado com sucesso!${NC}"
    
    # Mostrar logs
    echo -e "${YELLOW}📋 Últimas linhas do log:${NC}"
    docker-compose logs --tail=50
else
    echo -e "${RED}❌ Falha ao iniciar container. Verifique os logs:${NC}"
    docker-compose logs
    exit 1
fi

echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}🌐 Acesse: http://localhost:3000${NC}"
