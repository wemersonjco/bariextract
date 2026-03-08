# 🔍 Diagnóstico de Erro ao Salvar Dados

## 🚨 **Possíveis Causas do Erro**

### 1. **Erro de Campo (data_cirurgia vs dataCirurgia)**
**Sintoma:** `coluna dataCirurgia não existe`
**Solução:** ✅ Já corrigido anteriormente

### 2. **Erro de Permissão no Supabase**
**Sintoma:** `permission denied for table patients`
**Solução:** Verificar RLS e políticas de segurança

### 3. **Erro de Tipo de Dado**
**Sintoma:** `invalid input syntax for type uuid`
**Solução:** Verificar se patient_id está correto

### 4. **Erro de Conexão**
**Sintoma:** `could not connect to server`
**Solução:** Verificar variáveis de ambiente

## 🧪 **Como Diagnosticar**

### **Passo 1: Verificar Console do Navegador**
Pressione **F12** → **Console** e procure:
- Erros vermelhos
- Requisições falhadas
- Mensagens específicas

### **Passo 2: Verificar Console do Servidor**
No terminal onde executou `npm run dev`:
- Erros de conexão
- Erros de validação
- Logs de requisições

### **Passo 3: Verificar Network Tab**
Pressione **F12** → **Network**:
- Requisições para Supabase
- Status codes (200, 400, 500)
- Respostas de erro

## 🔧 **Soluções Rápidas**

### **Se for erro de permissão:**
```sql
-- Execute no SQL Editor do Supabase
DROP POLICY IF EXISTS "Users can manage their own patients" ON patients;
CREATE POLICY "Users can manage their own patients" ON patients
    FOR ALL USING (auth.uid()::text = id::text);
```

### **Se for erro de conexão:**
```cmd
# Verificar .env
cat .env
# Garantir que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão corretos
```

### **Se for erro de campo:**
```cmd
npm run build
npm run dev
# Rebuild para aplicar as correções
```

## 📋 **Informações para Me Enviar**

Para te ajudar melhor, me envie:

1. **Mensagem exata do erro** (print ou texto)
2. **O que aparece no console (F12)**
3. **Em qual momento ocorre** (extração completa ou complementar)
4. **Se você já executou o SQL no Supabase**

## 🎯 **Teste Após Correções**

```cmd
npm run build
npm run dev
```

1. Teste **"Nova Extração Completa"** com exemplo
2. Teste **"Extração Complementar"** se tiver pacientes
3. Verifique se os dados aparecem na lista

**Me envie o erro específico que aparece para te ajudar a resolver! 🎉**
