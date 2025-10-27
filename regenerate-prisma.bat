@echo off
echo ====================================
echo   Regenerando Prisma Client
echo ====================================
echo.

echo Parando processos Node.js...
taskkill /F /IM node.exe 2>nul

echo Aguardando 2 segundos...
timeout /t 2 /nobreak >nul

echo Removendo cache do Next.js...
if exist .next rd /s /q .next

echo Removendo pasta .prisma...
if exist node_modules\.prisma rd /s /q node_modules\.prisma

echo Aguardando 2 segundos...
timeout /t 2 /nobreak >nul

echo Regenerando Prisma Client...
call npx prisma generate

echo.
echo ====================================
echo   Concluido!
echo ====================================
echo.
echo Agora execute: npm run dev
echo.
pause


