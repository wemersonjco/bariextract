@echo off
setlocal enabledelayedexpansion

echo 🧪 Iniciando Teste Completo do Bariextract...
echo ========================================

:: 1. Verificar dependências
echo 📦 Verificando dependências...
if not exist "node_modules" (
    echo ❌ node_modules não encontrado. Instalando dependências...
    call npm install
    if errorlevel 1 (
        echo ❌ Falha ao instalar dependências
        pause
        exit /b 1
    )
)
echo ✅ Dependências OK

:: 2. Verificar variáveis de ambiente
echo.
echo 🔑 Verificando variáveis de ambiente...

if not exist ".env" (
    echo ⚠️  Arquivo .env não encontrado. Copiando .env.example...
    copy .env.example .env
    echo 📝 Edite o arquivo .env com suas chaves:
    echo    VITE_GEMINI_KEY=sua_chave_aqui
    echo    VITE_SUPABASE_URL=sua_url_supabase
    echo    VITE_SUPABASE_ANON_KEY=sua_chave_supabase
    echo.
    echo ⚠️  Configure as variáveis e execute novamente:
    echo    testar-sistema.bat
    pause
    exit /b 1
)

:: Verificar se as variáveis estão configuradas
findstr /C:"VITE_GEMINI_KEY=sua_chave_aqui" .env >nul
if not errorlevel 1 (
    echo ❌ VITE_GEMINI_KEY não configurada
    echo    Edite .env e adicione sua chave da API Gemini
    pause
    exit /b 1
)

findstr /C:"VITE_SUPABASE_URL=https://seu-projeto.supabase.co" .env >nul
if not errorlevel 1 (
    echo ❌ VITE_SUPABASE_URL não configurada
    echo    Edite .env e adicione sua URL do Supabase
    pause
    exit /b 1
)

echo ✅ Variáveis de ambiente OK

:: 3. Testar build
echo.
echo 🔨 Testando build do projeto...
call npm run build
if errorlevel 1 (
    echo ❌ Falha no build
    pause
    exit /b 1
)
echo ✅ Build bem-sucedido

:: 4. Iniciar servidor de desenvolvimento
echo.
echo 🚀 Iniciando servidor de desenvolvimento...
echo    O sistema estará disponível em: http://localhost:3000
echo    Pressione Ctrl+C para parar
echo.

:: Iniciar servidor
start /B npm run dev

:: Esperar um pouco para o servidor iniciar
timeout /t 10 >nul

:: 5. Verificar se o servidor está respondendo
echo.
echo 🔍 Verificando se o servidor está respondendo...
for /L %%i in (1 2 3 4 5 6 7 8 9 10) do (
    curl -s http://localhost:3000 >nul 2>&1
    if not errorlevel 1 (
        echo ✅ Servidor respondendo em http://localhost:3000
        goto :server_ok
    )
    echo ⏳ Aguardando servidor... (%%i/10)
    timeout /t 2 >nul
    
    if %%i==10 (
        echo ❌ Servidor não respondeu após 20 segundos
        pause
        exit /b 1
    )
)

:server_ok

:: 6. Resumo final
echo.
echo 📊 RESUMO DOS TESTES
echo ====================
echo ✅ Dependências: Instaladas
echo ✅ Variáveis: Configuradas  
echo ✅ Build: Sucesso
echo ✅ Servidor: http://localhost:3000
echo.
echo 🎉 SISTEMA PRONTO PARA USO!
echo.
echo 📱 Abra http://localhost:3000 no navegador
echo 📝 Teste os dois modos de extração:
echo    1. Nova Extração Completa
echo    2. Extração Complementar (Laboratoriais)
echo.
echo 🚀 Após os testes, pode fazer o deploy para Vercel:
echo    git add .
echo    git commit -m "Testes concluídos - pronto para deploy"
echo    git push origin main
echo.
pause
