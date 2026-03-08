# 🗄️ Como Criar as Tabelas no Supabase

## 📋 **Passo a Passo Completo**

### 1. **Acessar o Painel Supabase**
1. Abra https://supabase.com
2. Faça login com sua conta
3. Selecione seu projeto

### 2. **Abrir o SQL Editor**
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"+ New query"**
3. Cole o código abaixo

### 3. **Executar o Código**
1. Copie todo o conteúdo do arquivo `criar_tabelas_supabase.sql`
2. Cole no editor SQL
3. Clique em **"Run"** ou **Ctrl+Enter**

## 📄 **Código SQL Completo**

```sql
-- =====================================================
-- CRIAÇÃO COMPLETA DAS TABELAS DO BARIEXTRACT
-- Execute este SQL no painel do Supabase > SQL Editor
-- =====================================================

-- 1. Tabela principal de pacientes
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Identificação
  num TEXT,
  nome TEXT,
  prontuario TEXT,
  sexo TEXT,
  idade_primeira_consulta TEXT,
  municipio TEXT,
  estado_civil TEXT,
  num_filhos TEXT,
  ocupacao TEXT,
  escolaridade TEXT,
  cuidador_pos_op TEXT,
  
  -- Datas importantes
  data_primeira_consulta TEXT,
  data_emissao_aih TEXT,
  tempo_protocolo TEXT,
  data_cirurgia TEXT,
  idade_na_cirurgia TEXT,
  
  -- Dados cirúrgicos
  tipo_cirurgia TEXT,
  peso_inicial TEXT,
  peso_ultimo_pre_op TEXT,
  variacao_peso_pre_op TEXT,
  altura TEXT,
  imc_inicial TEXT,
  imc_ultimo_pre_op TEXT,
  expectativa_peso TEXT,
  perda_esperada TEXT,
  
  -- Hábitos
  tabagismo TEXT,
  etilismo TEXT,
  atividade_fisica_pre TEXT,
  comer_emocional TEXT,
  autoavaliacao_psicologica TEXT,
  obesidade_desde TEXT,
  tentativas_emagrecimento TEXT,
  cirurgias_previas TEXT,
  
  -- Comorbidades
  has TEXT,
  dm2 TEXT,
  dislipidemia TEXT,
  esteatose_hepatica TEXT,
  colelitiase_pre TEXT,
  asma TEXT,
  outras_comorbidades TEXT,
  medicacoes_em_uso TEXT,
  
  -- EDA e USG pré-operatórios
  h_pylori_resultado TEXT,
  h_pylori_situacao TEXT,
  eda_resultado TEXT,
  fez_colonoscopia TEXT,
  resultado_colonoscopia TEXT,
  outras_alteracoes_gi TEXT,
  usg_abdome TEXT,
  espirometria_resultado TEXT,
  rx_torax TEXT,
  eco_fe TEXT,
  eco_psap TEXT,
  eco_outras_alteracoes TEXT,
  risco_pulmonar TEXT,
  risco_cv TEXT,
  clexane_dose TEXT,
  
  -- Exames laboratoriais pré-operatórios (legados)
  hbA1c TEXT,
  glicemia_jejum TEXT,
  tsh TEXT,
  t4_livre TEXT,
  b12 TEXT,
  vitamina_d TEXT,
  colesterol_total TEXT,
  hdl TEXT,
  ldl TEXT,
  triglicerideos TEXT,
  tgo TEXT,
  tgp TEXT,
  
  -- Dados pós-operatórios
  peso_po_9dias TEXT,
  peso_po_40dias TEXT,
  peso_po_4_5meses TEXT,
  peso_po_5meses TEXT,
  peso_po_7meses TEXT,
  peso_po_11meses TEXT,
  peso_1ano_po TEXT,
  perda_absoluta_1ano TEXT,
  percent_excesso_peso_perdido TEXT,
  atividade_fisica_1ano_po TEXT,
  excesso_pele TEXT,
  complicacoes_po TEXT,
  adesao_suplementacao TEXT,
  alta_cb TEXT,
  observacoes_clinicas TEXT,
  ultimo_imc TEXT,
  
  -- EDA e USG pós-operatórios
  eda_pos_data TEXT,
  eda_pos_urease TEXT,
  eda_pos_h_pylori TEXT,
  eda_pos_achados TEXT,
  usg_pos_data TEXT,
  usg_pos_vesicula TEXT,
  usg_pos_observacoes TEXT,
  
  last_edited_at TIMESTAMPTZ
);

-- 2. Tabela de exames laboratoriais pré-operatórios
CREATE TABLE IF NOT EXISTS exames_laboratoriais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contexto da coleta
  data_lab_pre DATE,                    -- Data dos exames
  fonte_lab_pre TEXT,                    -- Fonte (ex: "Endocrinologia 24/04/2024")
  
  -- Exames pré-operatórios (valores numéricos)
  hb_pre FLOAT,                           -- Hemoglobina (g/dL)
  plaquetas_pre FLOAT,                    -- Plaquetas (/mm³)
  tgo_pre FLOAT,                          -- TGO/AST (U/L)
  tgp_pre FLOAT,                          -- TGP/ALT (U/L)
  ggt_pre FLOAT,                          -- GGT (U/L)
  glicemia_pre FLOAT,                     -- Glicemia jejum (mg/dL)
  hba1c_pre FLOAT,                        -- Hemoglobina glicada (%)
  creatinina_pre FLOAT,                    -- Creatinina (mg/dL)
  ureia_pre FLOAT,                         -- Ureia (mg/dL)
  ct_pre FLOAT,                            -- Colesterol total (mg/dL)
  hdl_pre FLOAT,                           -- HDL (mg/dL)
  ldl_pre FLOAT,                           -- LDL (mg/dL)
  tg_pre FLOAT,                            -- Triglicerídeos (mg/dL)
  vit_b12_pre FLOAT,                       -- Vitamina B12 (pg/mL)
  vit_d_pre FLOAT,                         -- Vitamina D 25-OH (ng/mL)
  ferro_pre FLOAT,                          -- Ferro sérico (µg/dL)
  ferritina_pre FLOAT,                      -- Ferritina (ng/mL)
  tsh_pre FLOAT,                           -- TSH (mUI/L)
  t4l_pre FLOAT,                           -- T4 livre (ng/dL)
  albumina_pre FLOAT,                       -- Albumina (g/dL)
  insulina_pre FLOAT,                       -- Insulina jejum (µUI/mL),
  
  -- Garante um registro de laboratoriais por paciente
  CONSTRAINT unique_patient_labs UNIQUE(patient_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_patients_nome ON patients(nome);
CREATE INDEX IF NOT EXISTS idx_patients_prontuario ON patients(prontuario);
CREATE INDEX IF NOT EXISTS idx_exames_laboratoriais_patient_id ON exames_laboratoriais(patient_id);

-- Habilitar RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE exames_laboratoriais ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança simplificadas
CREATE POLICY "Users can manage their own patients" ON patients
    FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "Users can manage their own exames" ON exames_laboratoriais
    FOR ALL USING (
        auth.uid()::text = (
            SELECT patient_id::text FROM patients WHERE id = exames_laboratoriais.patient_id
        )
    );
```

## ✅ **Resultado Esperado**

Após executar, você deve ver:

```
✅ Tabelas criadas com sucesso!
📋 patients: 0 registros
🩺 exames_laboratoriais: 0 registros
```

## 🧪 **Teste Após Criar Tabelas**

1. **Rebuild o projeto:**
   ```cmd
   npm run build
   npm run dev
   ```

2. **Teste a extração complementar:**
   - Abra http://localhost:3000
   - Clique em "Extração Complementar (Laboratoriais)"
   - Deve aparecer lista de pacientes (ou vazia se não tiver pacientes)

## 🚨 **Se Der Erro**

- **"relation does not exist"**: Execute o SQL novamente
- **"permission denied":** Verifique se você tem permissão no projeto
- **"syntax error":** Copie o código exatamente como está

**Execute o SQL e depois me diga se funcionou! 🎉**
