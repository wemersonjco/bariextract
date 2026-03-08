# 🚨 SOLUÇÃO RÁPIDA: Erro na Extração Complementar

## 🔍 **Problemas Mais Comuns e Soluções**

### 1. **Tabela exames_laboratoriais não existe**
**Erro:** `relation "exames_laboratoriais" does not exist`

**Solução:**
```sql
-- Execute no SQL Editor do Supabase
CREATE TABLE IF NOT EXISTS exames_laboratoriais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contexto
  data_lab_pre DATE,
  fonte_lab_pre TEXT,
  
  -- Exames pré-operatórios
  hb_pre FLOAT, plaquetas_pre FLOAT, tgo_pre FLOAT, tgp_pre FLOAT,
  ggt_pre FLOAT, glicemia_pre FLOAT, hba1c_pre FLOAT, creatinina_pre FLOAT,
  ureia_pre FLOAT, ct_pre FLOAT, hdl_pre FLOAT, ldl_pre FLOAT, tg_pre FLOAT,
  vit_b12_pre FLOAT, vit_d_pre FLOAT, ferro_pre FLOAT, ferritina_pre FLOAT,
  tsh_pre FLOAT, t4l_pre FLOAT, albumina_pre FLOAT, insulina_pre FLOAT,
  
  UNIQUE(patient_id)
);

-- Habilitar RLS
ALTER TABLE exames_laboratoriais ENABLE ROW LEVEL SECURITY;

-- Política simplificada
CREATE POLICY "Users can manage their own exames" ON exames_laboratoriais
    FOR ALL USING (
        auth.uid()::text = (
            SELECT patient_id::text FROM patients WHERE id = exames_laboratoriais.patient_id
        )
    );
```

### 2. **Erro de Permissão (RLS)**
**Erro:** `permission denied for table exames_laboratoriais`

**Solução:**
```sql
-- Remover e recriar política
DROP POLICY IF EXISTS "Users can manage their own exames" ON exames_laboratoriais;
CREATE POLICY "Users can manage their own exames" ON exames_laboratoriais
    FOR ALL USING (true); -- Temporariamente permitir tudo para teste
```

### 3. **Erro de Campo**
**Erro:** `column "xxx" does not exist`

**Solução:**
```sql
-- Verificar se a tabela tem todos os campos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'exames_laboratoriais' 
ORDER BY column_name;
```

## 🧪 **Como Testar a Solução**

### **Passo 1: Rebuild**
```cmd
npm run build
npm run dev
```

### **Passo 2: Testar com Dados Simples**
No modo complementar, cole este texto:
```
Paciente Teste
Exames laboratoriais:
Hb 14.2
Glicemia 95
TSH 1.5
```

### **Passo 3: Verificar Console**
Pressione **F12** → **Console** para ver erros específicos

## 🔧 **Se Nada Funcionar**

### **Opção A: Desabilitar RLS Temporariamente**
```sql
ALTER TABLE exames_laboratoriais DISABLE ROW LEVEL SECURITY;
```

### **Opção B: Verificar Conexão**
```cmd
# Verificar .env
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### **Opção C: Testar Conexão Direta**
No console do navegador:
```javascript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('sua-url', 'sua-key');
supabase.from('exames_laboratoriais').select('*').then(console.log);
```

## 📋 **Informações para Me Enviar**

Se ainda não funcionar, me envie:

1. **Mensagem exata do erro** (agora vai ser mais específica)
2. **Se você executou o SQL no Supabase**
3. **O que aparece no console (F12)**

**Execute o SQL acima e teste novamente! 🎉**
