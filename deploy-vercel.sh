#!/bin/bash

# Script para deploy na Vercel
echo "🚀 Preparando deploy na Vercel..."

# Verificar se há mudanças não commitadas
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Existem mudanças não commitadas:"
    git status --short
    echo ""
    read -p "Deseja fazer commit das mudanças? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "📝 Fazendo commit das mudanças..."
        git add .
        git commit -m "Preparando para deploy na Vercel"
        echo "✅ Commit realizado!"
    fi
fi

echo ""
echo "🔄 Fazendo push para o repositório..."
git push origin main

echo ""
echo "✨ Deploy iniciado! A Vercel irá automaticamente:"
echo "   1. Detectar as mudanças"
echo "   2. Executar o build"
echo "   3. Fazer o deploy"
echo ""
echo "📊 Acompanhe o progresso no painel da Vercel!"
echo "🌐 Após o deploy, acesse: https://seu-projeto.vercel.app"
