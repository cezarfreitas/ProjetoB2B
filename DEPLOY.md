# Deploy - B2B Tropical

## Pré-requisitos

- Docker instalado no VPS
- EaxyPanel instalado
- Banco de dados MySQL configurado
- Domínio apontado para o VPS

## 1. Preparação do Ambiente

### No VPS, crie um diretório para o projeto:

```bash
mkdir -p /var/www/b2b-tropical
cd /var/www/b2b-tropical
```

### Clone o repositório:

```bash
git clone https://github.com/cezarfreitas/ProjetoB2B.git .
```

## 2. Configuração de Variáveis de Ambiente

Crie o arquivo `.env`:

```bash
cp .env.example .env
nano .env
```

Configure as seguintes variáveis:

```env
DATABASE_URL=mysql://usuario:senha@host:3306/nome_do_banco
JWT_SECRET=uma-chave-secreta-aleatoria-e-segura
NODE_ENV=production
```

## 3. Build e Execução com Docker

### Opção 1: Usando Docker Compose (Recomendado)

```bash
docker-compose up -d --build
```

### Opção 2: Usando Docker diretamente

```bash
# Build da imagem
docker build -t b2b-tropical .

# Executar container
docker run -d \
  --name b2b-tropical \
  --restart unless-stopped \
  -p 3000:3000 \
  -v $(pwd)/public/uploads:/app/public/uploads \
  --env-file .env \
  b2b-tropical
```

## 4. Configuração no EaxyPanel

1. Acesse o EaxyPanel
2. Crie um novo site
3. Configure um Proxy Reverso apontando para `localhost:3000`
4. Configure o SSL (Let's Encrypt)

### Nginx Configuration (Exemplo)

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 5. Persistência de Dados

### Uploads de Imagens

Os uploads são salvos em `public/uploads`. Para manter após rebuilds:

```bash
# Crie um volume persistente
docker volume create b2b-uploads
```

Atualize o `docker-compose.yml`:

```yaml
volumes:
  - b2b-uploads:/app/public/uploads

volumes:
  b2b-uploads:
```

## 6. Comandos Úteis

### Ver logs do container:
```bash
docker logs -f b2b-tropical
```

### Reiniciar o container:
```bash
docker-compose restart
```

### Atualizar a aplicação:
```bash
git pull
docker-compose up -d --build
```

### Acessar o container:
```bash
docker exec -it b2b-tropical sh
```

## 7. Troubleshooting

### Verificar se o container está rodando:
```bash
docker ps | grep b2b-tropical
```

### Ver logs de erro:
```bash
docker logs b2b-tropical 2>&1 | tail -n 100
```

### Testar conexão com banco:
```bash
docker exec -it b2b-tropical node -e "console.log(process.env.DATABASE_URL)"
```

## 8. Backup

### Backup do Banco de Dados (EaxyPanel):
- Use o painel do EaxyPanel para criar backups automáticos do MySQL

### Backup de Uploads:
```bash
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz public/uploads/
```

## 9. Monitoramento

### Verificar uso de recursos:
```bash
docker stats b2b-tropical
```

### Verificar conectividade:
```bash
curl http://localhost:3000
```

## Segurança

1. Altere o `JWT_SECRET` para um valor forte e único
2. Mantenha o Docker atualizado
3. Configure firewall (UFW) para proteger portas
4. Use HTTPS (SSL) em produção
5. Faça backups regulares

## Suporte

Para problemas ou dúvidas, consulte os logs do container ou abra uma issue no repositório.
