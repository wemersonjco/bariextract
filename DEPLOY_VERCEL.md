# Deploy na Vercel

## 🚀 **Passo a Passo para Deploy**

### 1. **Preparação do Repositório**
```bash
# Commit todas as mudanças
git add .
git commit -m "Preparando para deploy na Vercel"
git push origin main
```

### 2. **Configurar Variáveis de Ambiente na Vercel**

Acesse seu projeto na Vercel e vá em:
`Settings > Environment Variables`

Adicione as seguintes variáveis:

#### **Obrigatórias:**
- **Nome**: `GEMINI_API_KEY`
- **Valor**: Sua chave da API Gemini
- **Ambientes**: Production, Preview, Development

#### **Opcionais (se usar Supabase):**
- **Nome**: `VITE_SUPABASE_URL`
- **Valor**: URL do seu projeto Supabase
- **Ambientes**: Production, Preview, Development

- **Nome**: `VITE_SUPABASE_ANON_KEY`  
- **Valor**: Chave anônima do Supabase
- **Ambientes**: Production, Preview, Development

### 3. **Deploy Automático**

A Vercel irá automaticamente:
1. Detectar que é um projeto React/Vite
2. Usar o script `vercel-build` (que executa `npm run build`)
3. Fazer o deploy da pasta `dist`

### 4. **Configurações Adicionais (Opcional)**

#### **Custom Domain:**
- Vá para `Settings > Domains`
- Adicione seu domínio personalizado

#### **Build Settings:**
- Framework Preset: Vite
- Build Command: `npm run vercel-build`
- Output Directory: `dist`
- Install Command: `npm install`

## 🔧 **Arquivos de Configuração Criados**

### `vercel.json`
- Configura rotas para SPA
- Define variáveis de ambiente
- Otimiza build para produção

### `vite.config.ts` atualizado
- Base path dinâmico (`/` para produção)
- Otimização de chunks
- Source maps habilitados

### `package.json` atualizado
- Script `vercel-build`
- Nome e versão atualizados
- Removido scripts do GitHub Pages

## 📋 **Verificação Pós-Deploy**

1. **Teste a aplicação** no ambiente de produção
2. **Verifique o console** para erros
3. **Confirme as variáveis de ambiente** estão funcionando
4. **Teste upload de arquivos** e processamento

## 🚨 **Possíveis Problemas e Soluções**

### **Erro: GEMINI_API_KEY não encontrada**
- Verifique se a variável foi configurada na Vercel
- Confirme o nome exato: `GEMINI_API_KEY`

### **Erro: Rotas não encontradas (404)**
- O `vercel.json` deve redirecionar para `index.html`
- Verifique se o arquivo está na raiz do projeto

### **Build falhando**
- Verifique se todas as dependências estão em `dependencies`
- Teste localmente: `npm run build`

## 🎯 **Resultado Final**

Após o deploy, sua aplicação estará disponível em:
- URL da Vercel: `https://seu-projeto.vercel.app`
- Com domínio personalizado (se configurado)

## 🔄 **Deploy Automático**

A cada push para a branch `main`, a Vercel irá:
1. Fazer automaticamente o deploy
2. Atualizar a aplicação
3. Manter o histórico de deploys

---

**Pronto! Sua aplicação está configurada para deploy na Vercel! 🚀**
