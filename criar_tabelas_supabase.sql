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
  insulina_pre FLOAT,                       -- Insulina jejum (µUI/mL)
  
  -- Garante um registro de laboratoriais por paciente
  CONSTRAINT unique_patient_labs UNIQUE(patient_id)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para tabela patients
CREATE INDEX IF NOT EXISTS idx_patients_nome ON patients(nome);
CREATE INDEX IF NOT EXISTS idx_patients_prontuario ON patients(prontuario);
CREATE INDEX IF NOT EXISTS idx_patients_data_cirurgia ON patients(data_cirurgia);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);

-- Índices para tabela exames_laboratoriais
CREATE INDEX IF NOT EXISTS idx_exames_laboratoriais_patient_id ON exames_laboratoriais(patient_id);
CREATE INDEX IF NOT EXISTS idx_exames_laboratoriais_data_lab ON exames_laboratoriais(data_lab_pre);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE exames_laboratoriais ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela patients
CREATE POLICY "Users can view their own patients" ON patients
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own patients" ON patients
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own patients" ON patients
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can delete their own patients" ON patients
    FOR DELETE USING (auth.uid()::text = id::text);

-- Políticas para tabela exames_laboratoriais
CREATE POLICY "Users can view their own exames laboratoriais" ON exames_laboratoriais
    FOR SELECT USING (
        auth.uid()::text = (
            SELECT patient_id::text FROM patients WHERE id = exames_laboratoriais.patient_id
        )
    );

CREATE POLICY "Users can insert their own exames laboratoriais" ON exames_laboratoriais
    FOR INSERT WITH CHECK (
        auth.uid()::text = (
            SELECT patient_id::text FROM patients WHERE id = exames_laboratoriais.patient_id
        )
    );

CREATE POLICY "Users can update their own exames laboratoriais" ON exames_laboratoriais
    FOR UPDATE USING (
        auth.uid()::text = (
            SELECT patient_id::text FROM patients WHERE id = exames_laboratoriais.patient_id
        )
    );

CREATE POLICY "Users can delete their own exames laboratoriais" ON exames_laboratoriais
    FOR DELETE USING (
        auth.uid()::text = (
            SELECT patient_id::text FROM patients WHERE id = exames_laboratoriais.patient_id
        )
    );

-- =====================================================
-- TRIGGERS PARA updated_at
-- =====================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para patients
CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para exames_laboratoriais
CREATE TRIGGER update_exames_laboratoriais_updated_at 
    BEFORE UPDATE ON exames_laboratoriais 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('patients', 'exames_laboratoriais')
ORDER BY table_name;

-- Contar registros existentes
SELECT 
    'patients' as tabela,
    COUNT(*) as total_registros
FROM patients
UNION ALL
SELECT 
    'exames_laboratoriais' as tabela,
    COUNT(*) as total_registros
FROM exames_laboratoriais;

-- =====================================================
-- COMENTÁRIOS IMPORTANTES
-- =====================================================

/*
VALORES DE REFERÊNCIA PARA EXAMES LABORATORIAIS:

- hb_pre: Hemoglobina (12-16 g/dL homens, 11.5-15.5 g/dL mulheres)
- plaquetas_pre: Plaquetas (150-450 x 10³/µL)
- tgo_pre: TGO/AST (< 40 U/L)
- tgp_pre: TGP/ALT (< 40 U/L)
- ggt_pre: GGT (< 50 U/L homens, < 35 U/L mulheres)
- glicemia_pre: Glicemia jejum (70-100 mg/dL)
- hba1c_pre: Hemoglobina glicada (< 6.5%)
- creatinina_pre: Creatinina (0.6-1.2 mg/dL)
- ct_pre: Colesterol total (< 200 mg/dL)
- hdl_pre: HDL (> 40 mg/dL)
- ldl_pre: LDL (< 130 mg/dL)
- tg_pre: Triglicerídeos (< 150 mg/dL)
- vit_b12_pre: Vitamina B12 (200-900 pg/mL)
- vit_d_pre: Vitamina D (30-100 ng/mL)
- tsh_pre: TSH (0.4-4.0 mUI/L)
- t4l_pre: T4 livre (0.8-2.0 ng/dL)

NOTAS IMPORTANTES:
1. Todos os valores são NULLABLE para casos onde o exame não foi realizado
2. data_lab_pre deve ser NULL se não houver data definida
3. fonte_lab_pre é TEXT para acomodar descrições variadas
4. UNIQUE constraint garante um registro de laboratoriais por paciente
5. CASCADE delete remove labs automaticamente se paciente for excluído
6. RLS garante que cada usuário só veja seus próprios dados
7. Índices otimizam performance para consultas frequentes
*/
