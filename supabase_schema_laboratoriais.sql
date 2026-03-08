-- Tabela para exames laboratoriais pré-operatórios
-- Vinculada à tabela patients através de patient_id (UUID)

CREATE TABLE exames_laboratoriais (
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
  insulina_pre FLOAT,                       -- Insulina jejum (µUI/mL)
  
  -- Garante um registro de laboratoriais por paciente
  CONSTRAINT unique_patient_labs UNIQUE(patient_id)
);

-- Índices para performance
CREATE INDEX idx_exames_laboratoriais_patient_id ON exames_laboratoriais(patient_id);
CREATE INDEX idx_exames_laboratoriais_data_lab ON exames_laboratoriais(data_lab_pre);

-- RLS (Row Level Security) - mesmo padrão da tabela patients
ALTER TABLE exames_laboratoriais ENABLE ROW LEVEL SECURITY;

-- Política para leitura (mesmo padrão das outras tabelas)
CREATE POLICY "Users can view their own exames laboratoriais" ON exames_laboratoriais
    FOR SELECT USING (
        auth.uid()::text = (
            SELECT patient_id::text FROM patients WHERE id = exames_laboratoriais.patient_id
        )
    );

-- Política para inserção
CREATE POLICY "Users can insert their own exames laboratoriais" ON exames_laboratoriais
    FOR INSERT WITH CHECK (
        auth.uid()::text = (
            SELECT patient_id::text FROM patients WHERE id = exames_laboratoriais.patient_id
        )
    );

-- Política para atualização
CREATE POLICY "Users can update their own exames laboratoriais" ON exames_laboratoriais
    FOR UPDATE USING (
        auth.uid()::text = (
            SELECT patient_id::text FROM patients WHERE id = exames_laboratoriais.patient_id
        )
    );

-- Comentários sobre os campos:
/*
CAMPOS PRINCIPAIS:
- hb_pre: Hemoglobina (valores normais: 12-16 g/dL para homens, 11.5-15.5 g/dL para mulheres)
- plaquetas_pre: Plaquetas (valores normais: 150-450 x 10³/µL)
- tgo_pre: TGO/AST (valores normais: < 40 U/L)
- tgp_pre: TGP/ALT (valores normais: < 40 U/L)
- ggt_pre: GGT (valores normais: < 50 U/L para homens, < 35 U/L para mulheres)
- glicemia_pre: Glicemia jejum (valores normais: 70-100 mg/dL)
- hba1c_pre: Hemoglobina glicada (valores normais: < 6.5%)
- creatinina_pre: Creatinina (valores normais: 0.6-1.2 mg/dL)
- ct_pre: Colesterol total (valores normais: < 200 mg/dL)
- hdl_pre: HDL (valores normais: > 40 mg/dL)
- ldl_pre: LDL (valores normais: < 130 mg/dL)
- tg_pre: Triglicerídeos (valores normais: < 150 mg/dL)
- vit_b12_pre: Vitamina B12 (valores normais: 200-900 pg/mL)
- vit_d_pre: Vitamina D (valores normais: 30-100 ng/mL)
- tsh_pre: TSH (valores normais: 0.4-4.0 mUI/L)
- t4l_pre: T4 livre (valores normais: 0.8-2.0 ng/dL)

OBSERVAÇÕES IMPORTANTES:
1. Todos os valores são NULLABLE para casos onde o exame não foi realizado
2. data_lab_pre deve ser NULL se não houver data definida
3. fonte_lab_pre é TEXT para acomodar descrições variadas
4. UNIQUE constraint garante um registro por paciente
5. CASCADE delete remove labs automaticamente se paciente for excluído
*/
