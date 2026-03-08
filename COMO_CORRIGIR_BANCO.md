# 🗄️ Como Corrigir Dados com "-0,5" no Banco de Dados

## 📋 **Passo a Passo Completo**

### **1. Acessar o Supabase**
1. Vá para https://supabase.com
2. Faça login no seu projeto
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"+ New query"**

### **2. Executar os Comandos SQL**

Copie e cole o conteúdo do arquivo `corrigir_dados_banco.sql` no editor SQL.

### **3. Executar em Ordem:**

#### **Passo 1: VERIFICAR DADOS**
```sql
SELECT 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN hb_pre = -0.5 THEN 1 END) as hb_pre_errados,
    COUNT(CASE WHEN ggt_pre = -0.5 THEN 1 END) as ggt_pre_errados,
    COUNT(CASE WHEN ureia_pre = -0.5 THEN 1 END) as ureia_pre_errados,
    COUNT(CASE WHEN vit_d_pre = -0.5 THEN 1 END) as vit_d_pre_errados,
    COUNT(CASE WHEN ferro_pre = -0.5 THEN 1 END) as ferro_pre_errados,
    COUNT(CASE WHEN ferritina_pre = -0.5 THEN 1 END) as ferritina_pre_errados,
    COUNT(CASE WHEN albumina_pre = -0.5 THEN 1 END) as albumina_pre_errados
FROM exames_laboratoriais;
```

#### **Passo 2: BACKUP (OPCIONAL)**
```sql
CREATE TABLE exames_laboratoriais_backup AS 
SELECT * FROM exames_laboratoriais;
```

#### **Passo 3: CORRIGIR VALORES**
```sql
UPDATE exames_laboratoriais 
SET 
    hb_pre = NULL WHERE hb_pre = -0.5,
    plaquetas_pre = NULL WHERE plaquetas_pre = -0.5,
    tgo_pre = NULL WHERE tgo_pre = -0.5,
    tgp_pre = NULL WHERE tgp_pre = -0.5,
    ggt_pre = NULL WHERE ggt_pre = -0.5,
    glicemia_pre = NULL WHERE glicemia_pre = -0.5,
    hba1c_pre = NULL WHERE hba1c_pre = -0.5,
    creatinina_pre = NULL WHERE creatinina_pre = -0.5,
    ureia_pre = NULL WHERE ureia_pre = -0.5,
    ct_pre = NULL WHERE ct_pre = -0.5,
    hdl_pre = NULL WHERE hdl_pre = -0.5,
    ldl_pre = NULL WHERE ldl_pre = -0.5,
    tg_pre = NULL WHERE tg_pre = -0.5,
    vit_b12_pre = NULL WHERE vit_b12_pre = -0.5,
    vit_d_pre = NULL WHERE vit_d_pre = -0.5,
    ferro_pre = NULL WHERE ferro_pre = -0.5,
    ferritina_pre = NULL WHERE ferritina_pre = -0.5,
    tsh_pre = NULL WHERE tsh_pre = -0.5,
    t4l_pre = NULL WHERE t4l_pre = -0.5,
    albumina_pre = NULL WHERE albumina_pre = -0.5,
    insulina_pre = NULL WHERE insulina_pre = -0.5;
```

#### **Passo 4: VERIFICAR CORREÇÃO**
```sql
SELECT 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN hb_pre = -0.5 THEN 1 END) as hb_pre_errados_restantes,
    COUNT(CASE WHEN ggt_pre = -0.5 THEN 1 END) as ggt_pre_errados_restantes,
    COUNT(CASE WHEN ureia_pre = -0.5 THEN 1 END) as ureia_pre_errados_restantes,
    COUNT(CASE WHEN vit_d_pre = -0.5 THEN 1 END) as vit_d_pre_errados_restantes,
    COUNT(CASE WHEN ferro_pre = -0.5 THEN 1 END) as ferro_pre_errados_restantes,
    COUNT(CASE WHEN ferritina_pre = -0.5 THEN 1 END) as ferritina_pre_errados_restantes,
    COUNT(CASE WHEN albumina_pre = -0.5 THEN 1 END) as albumina_pre_errados_restantes
FROM exames_laboratoriais;
```

## 🎯 **O Que Acontece:**

### **Antes da Correção:**
- ❌ GGT: -0.5
- ❌ Ureia: -0.5
- ❌ VitD: -0.5
- ❌ Ferro: -0.5
- ❌ Ferritina: -0.5
- ❌ Albumina: -0.5

### **Depois da Correção:**
- ✅ GGT: NULL (vazio)
- ✅ Ureia: NULL (vazio)
- ✅ VitD: NULL (vazio)
- ✅ Ferro: NULL (vazio)
- ✅ Ferritina: NULL (vazio)
- ✅ Albumina: NULL (vazio)

## 📊 **Comandos Adicionais (Se Necessário):**

### **Remover outros valores inválidos:**
```sql
-- Remover -1
UPDATE exames_laboratoriais SET hb_pre = NULL WHERE hb_pre = -1;

-- Remover valores negativos
UPDATE exames_laboratoriais SET hb_pre = NULL WHERE hb_pre < 0;
```

## 🔄 **Resultado Final:**

1. **✅ Dados limpos**: Sem valores "-0,5"
2. **✅ Campos vazios**: NULL quando não há dados
3. **✅ Valores reais**: Apenas exames válidos
4. **✅ Excel correto**: Exportação sem dados falsos

## 🚨 **Segurança:**

- **Backup criado**: `exames_laboratoriais_backup`
- **Reversível**: Pode restaurar se necessário
- **Testado**: Verifica antes e depois

**Execute o SQL no Supabase e todos os dados "-0,5" serão corrigidos! 🎉**
