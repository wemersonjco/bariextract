# 🧪 Guia de Teste do BariExtract

## 📋 **Passo a Passo - Como Testar o Sistema**

### 🚀 **Método 1: Script Automático (Recomendado)**

#### **Windows:**
```cmd
.\testar-sistema.bat
```

#### **Linux/Mac:**
```bash
chmod +x testar-sistema.sh
./testar-sistema.sh
```

### 📝 **Método 2: Manual Passo a Passo**

#### **1. Verificar e Instalar Dependências**
```cmd
npm install
```

#### **2. Configurar Variáveis de Ambiente**
```cmd
# Se não tiver .env, copie o exemplo:
copy .env.example .env

# Edite o arquivo .env com suas chaves:
VITE_GEMINI_KEY=sua_chave_gemini_aqui
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_supabase_aqui
```

#### **3. Testar Build**
```cmd
npm run build
```

#### **4. Iniciar Servidor de Desenvolvimento**
```cmd
npm run dev
```

#### **5. Acessar Sistema**
Abra o navegador em: **http://localhost:3000**

---

## 🧪 **Testes Funcionais**

### ✅ **Teste 1: Nova Extração Completa**
1. Clique em **"Nova Extração Completa"**
2. Clique em **"Usar Exemplo"** para carregar dados de teste
3. Clique em **"Extrair Dados"**
4. **Verifique:**
   - ✅ Extração funciona sem erros
   - ✅ Dados aparecem na lista de pacientes
   - ✅ Todos os campos são preenchidos

### ✅ **Teste 2: Extração Complementar**
1. Clique em **"Extração Complementar (Laboratoriais)"**
2. **Se aparecer lista vazia:** Normal, é primeiro uso
3. **Se aparecer lista:** Selecione um paciente
4. Cole o texto de exemplo:
```
Paciente: João Teste
Exames pré-operatórios:
Hb 14.2 g/dL
Ht 42%
TGO 25 U/L
TGP 30 U/L
Glicemia 95 mg/dL
TSH 1.5 mUI/L
CT 180 mg/dL
HDL 45 mg/dL
LDL 110 mg/dL
Triglicerídeos 140 mg/dL
Vitamina D 35 ng/mL
```
5. Clique em **"Extrair Laboratoriais"**
6. **Verifique:**
   - ✅ Extração funciona sem erros
   - ✅ Valores numéricos são extraídos corretamente
   - ✅ Datas no formato DD/MM/YYYY

### ✅ **Teste 3: Upload de Arquivos**
1. Arraste um arquivo **.txt** ou **.pdf** para a área
2. Clique em **"Extrair Dados"**
3. **Verifique:**
   - ✅ Arquivo é processado
   - ✅ Dados são extraídos corretamente

---

## 🔍 **Verificações Técnicas**

### ✅ **Console do Navegador**
Pressione **F12** e verifique se há erros:
- Sem erros de JavaScript
- Sem erros de rede (CORS, 404, 500)
- Requisições à API Gemini sendo executadas

### ✅ **Console do Servidor**
No terminal onde executou `npm run dev`:
- Servidor iniciando na porta 3000
- Sem erros de build ou TypeScript
- Logs de requisiões aparecendo

### ✅ **Network Tab**
Na aba Network do F12:
- Requisições para API Gemini aparecendo
- Status 200 (OK) ou erros específicos
- Respostas JSON sendo recebidas

---

## 🚨 **Problemas Comuns e Soluções**

### ❌ **"VITE_GEMINI_KEY não configurada"**
**Solução:** Edite `.env` com sua chave da API Gemini

### ❌ **"Falha na conexão com a API"**
**Solução:** Verifique sua chave e conexão com internet

### ❌ **"Build falhou"**
**Solução:** Verifique se há erros de TypeScript
```cmd
npm run lint
```

### ❌ **"Servidor não responde"**
**Solução:** Verifique se a porta 3000 está livre
```cmd
netstat -an | findstr :3000
```

### ❌ **"Extração não retorna dados"**
**Solução:** 
1. Verifique formato do texto de entrada
2. Teste com o exemplo fornecido
3. Verifique logs de erro no console

---

## 📊 **Teste de Performance**

### ✅ **Extração em Lote**
Teste com múltiplos arquivos simultaneamente:
- Arraste 5 arquivos .txt
- Verifique se o sistema processa todos
- Monitore o progresso

### ✅ **Modo Dual**
Teste alternando entre os modos:
1. Extração completa de paciente novo
2. Extração complementar do mesmo paciente
3. Verifique se dados não são sobrescritos

---

## 🎯 **Critérios de Sucesso**

O sistema está pronto para deploy quando:

- ✅ **Build funciona** sem erros
- ✅ **Servidor inicia** sem problemas
- ✅ **API Gemini conecta** e responde
- ✅ **Extração completa** funciona
- ✅ **Extração complementar** funciona
- ✅ **Upload de arquivos** funciona
- ✅ **Dados são salvos** localmente
- ✅ **Interface responsiva** funciona

---

## 🚀 **Próximo Passo: Deploy para Vercel**

Após todos os testes passarem:

```cmd
git add .
git commit -m "Testes concluídos - pronto para deploy"
git push origin main
```

Configure as variáveis de ambiente no painel Vercel:
- `VITE_GEMINI_KEY`: Sua chave da API Gemini
- `VITE_SUPABASE_URL`: URL do Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave do Supabase

---

**🎉 Sistema testado e pronto para produção!**
