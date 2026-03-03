# ✅ Checklist Deploy Vercel

## 🚀 **ANTES DO DEPLOY**

### ✅ **Configurações do Projeto**
- [x] `vercel.json` criado e configurado
- [x] `vite.config.ts` atualizado para produção
- [x] `package.json` com script `vercel-build`
- [x] `.gitignore` atualizado
- [x] Build local testado e funcionando

### ✅ **Variáveis de Ambiente**
Configure no painel Vercel > Settings > Environment Variables:

- [ ] **GEMINI_API_KEY** (obrigatório)
  - Valor: Sua chave da API Gemini
  - Ambientes: Production, Preview, Development

- [ ] **VITE_SUPABASE_URL** (opcional)
  - Valor: URL do Supabase
  - Ambientes: Production, Preview, Development

- [ ] **VITE_SUPABASE_ANON_KEY** (opcional)
  - Valor: Chave Supabase
  - Ambientes: Production, Preview, Development

## 🔄 **PROCESSO DE DEPLOY**

### **Opção 1: Script Automático**
```bash
# Windows
./deploy-vercel.bat

# Linux/Mac
./deploy-vercel.sh
```

### **Opção 2: Manual**
```bash
git add .
git commit -m "Deploy para Vercel"
git push origin main
```

## 📋 **VERIFICAÇÃO PÓS-DEPLOY**

- [ ] Acessar URL da Vercel
- [ ] Testar upload de arquivos
- [ ] Verificar processamento com API Gemini
- [ ] Testar exportação Excel
- [ ] Verificar console para erros
- [ ] Testar em dispositivos móveis

## 🚨 **PROBLEMAS COMUNS**

### **Erro 404 em rotas**
- Verifique se `vercel.json` está no repositório
- Confirme redirecionamento para `index.html`

### **Variáveis não encontradas**
- Verifique nomes exatos no painel Vercel
- Confirme ambientes selecionados
- Reinicie o deploy após alterar variáveis

### **Build falhando**
- Teste local: `npm run build`
- Verifique dependências em `package.json`
- Confirme TypeScript sem erros

## 🎯 **URLs**

- **Produção**: `https://seu-projeto.vercel.app`
- **Preview**: `https://seu-commit.seu-projeto.vercel.app`
- **Painel**: `https://vercel.com/dashboard`

## 📊 **MONITORAMENTO**

- Acompanhe logs no painel Vercel
- Monitore performance no Analytics
- Verifique erro reports no console

---

**🎉 Projeto pronto para deploy na Vercel!**
