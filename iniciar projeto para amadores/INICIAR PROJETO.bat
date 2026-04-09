@echo off
title Oficina Bandeira - Iniciando...
color 0A

echo.
echo  =====================================================
echo   OFICINA BANDEIRA - Iniciando Backend e Frontend
echo  =====================================================
echo.

echo  [1/2] Iniciando Backend (.NET)...
start "Backend - Oficina Bandeira" cmd /k "cd /d "%~dp0..\backend-dotnet" && dotnet run"

timeout /t 4 /nobreak >nul

echo  [2/2] Iniciando Frontend (Vue)...
start "Frontend - Oficina Bandeira" cmd /k "cd /d "%~dp0..\frontend" && npm run dev"

echo.
echo  Tudo certo! Aguarde os dois terminais abrirem.
echo.
echo  Acesse o site em:  http://localhost:5173
echo  API rodando em:    http://localhost:3001
echo.
pause
