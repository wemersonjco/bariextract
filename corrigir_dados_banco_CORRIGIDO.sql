-- =====================================================
-- CORREÇÃO DE DADOS: Remover valores -0,5 dos exames laboratoriais
-- VERSÃO CORRIGIDA - Execute este SQL no painel do Supabase > SQL Editor
-- =====================================================

-- 1. VERIFICAR QUANTOS REGISTROS AFETADOS
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

-- 2. BACKUP DOS DADOS ANTES DA CORREÇÃO (OPCIONAL)
CREATE TABLE exames_laboratoriais_backup AS 
SELECT * FROM exames_laboratoriais;

-- 3. CORRIGIR VALORES -0.5 PARA NULL (UM CAMPO POR VEZ)
UPDATE exames_laboratoriais SET hb_pre = NULL WHERE hb_pre = -0.5;
UPDATE exames_laboratoriais SET plaquetas_pre = NULL WHERE plaquetas_pre = -0.5;
UPDATE exames_laboratoriais SET tgo_pre = NULL WHERE tgo_pre = -0.5;
UPDATE exames_laboratoriais SET tgp_pre = NULL WHERE tgp_pre = -0.5;
UPDATE exames_laboratoriais SET ggt_pre = NULL WHERE ggt_pre = -0.5;
UPDATE exames_laboratoriais SET glicemia_pre = NULL WHERE glicemia_pre = -0.5;
UPDATE exames_laboratoriais SET hba1c_pre = NULL WHERE hba1c_pre = -0.5;
UPDATE exames_laboratoriais SET creatinina_pre = NULL WHERE creatinina_pre = -0.5;
UPDATE exames_laboratoriais SET ureia_pre = NULL WHERE ureia_pre = -0.5;
UPDATE exames_laboratoriais SET ct_pre = NULL WHERE ct_pre = -0.5;
UPDATE exames_laboratoriais SET hdl_pre = NULL WHERE hdl_pre = -0.5;
UPDATE exames_laboratoriais SET ldl_pre = NULL WHERE ldl_pre = -0.5;
UPDATE exames_laboratoriais SET tg_pre = NULL WHERE tg_pre = -0.5;
UPDATE exames_laboratoriais SET vit_b12_pre = NULL WHERE vit_b12_pre = -0.5;
UPDATE exames_laboratoriais SET vit_d_pre = NULL WHERE vit_d_pre = -0.5;
UPDATE exames_laboratoriais SET ferro_pre = NULL WHERE ferro_pre = -0.5;
UPDATE exames_laboratoriais SET ferritina_pre = NULL WHERE ferritina_pre = -0.5;
UPDATE exames_laboratoriais SET tsh_pre = NULL WHERE tsh_pre = -0.5;
UPDATE exames_laboratoriais SET t4l_pre = NULL WHERE t4l_pre = -0.5;
UPDATE exames_laboratoriais SET albumina_pre = NULL WHERE albumina_pre = -0.5;
UPDATE exames_laboratoriais SET insulina_pre = NULL WHERE insulina_pre = -0.5;

-- 4. VERIFICAR SE A CORREÇÃO FUNCIONOU
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

-- 5. VERIFICAR DADOS CORRIGIDOS (EXEMPLO)
SELECT 
    p.nome,
    e.hb_pre,
    e.ggt_pre,
    e.ureia_pre,
    e.vit_d_pre,
    e.ferro_pre,
    e.ferritina_pre,
    e.albumina_pre
FROM exames_laboratoriais e
JOIN patients p ON e.patient_id = p.id
WHERE e.hb_pre IS NOT NULL 
   OR e.ggt_pre IS NOT NULL 
   OR e.ureia_pre IS NOT NULL
   OR e.vit_d_pre IS NOT NULL
   OR e.ferro_pre IS NOT NULL
   OR e.ferritina_pre IS NOT NULL
   OR e.albumina_pre IS NOT NULL
LIMIT 10;

-- =====================================================
-- COMANDOS ADICIONAIS (SE NECESSÁRIO)
-- =====================================================

-- 6. REMOVER OUTROS VALORES INVÁLIDOS (SE TIVER)
UPDATE exames_laboratoriais SET hb_pre = NULL WHERE hb_pre = -1;
UPDATE exames_laboratoriais SET ggt_pre = NULL WHERE ggt_pre = -1;
UPDATE exames_laboratoriais SET ureia_pre = NULL WHERE ureia_pre = -1;
UPDATE exames_laboratoriais SET vit_d_pre = NULL WHERE vit_d_pre = -1;
UPDATE exames_laboratoriais SET ferro_pre = NULL WHERE ferro_pre = -1;
UPDATE exames_laboratoriais SET ferritina_pre = NULL WHERE ferritina_pre = -1;
UPDATE exames_laboratoriais SET albumina_pre = NULL WHERE albumina_pre = -1;

-- 7. REMOVER VALORES NEGATIVOS (SE TIVER)
UPDATE exames_laboratoriais SET hb_pre = NULL WHERE hb_pre < 0;
UPDATE exames_laboratoriais SET ggt_pre = NULL WHERE ggt_pre < 0;
UPDATE exames_laboratoriais SET ureia_pre = NULL WHERE ureia_pre < 0;
UPDATE exames_laboratoriais SET vit_d_pre = NULL WHERE vit_d_pre < 0;
UPDATE exames_laboratoriais SET ferro_pre = NULL WHERE ferro_pre < 0;
UPDATE exames_laboratoriais SET ferritina_pre = NULL WHERE ferritina_pre < 0;
UPDATE exames_laboratoriais SET albumina_pre = NULL WHERE albumina_pre < 0;

-- 8. VERIFICAR RESULTADO FINAL
SELECT 
    'Após correção' as status,
    COUNT(*) as total_pacientes_com_labs,
    COUNT(CASE WHEN hb_pre > 0 THEN 1 END) as hb_validos,
    COUNT(CASE WHEN ggt_pre > 0 THEN 1 END) as ggt_validos,
    COUNT(CASE WHEN ureia_pre > 0 THEN 1 END) as ureia_validos,
    COUNT(CASE WHEN vit_d_pre > 0 THEN 1 END) as vit_d_validos,
    COUNT(CASE WHEN ferro_pre > 0 THEN 1 END) as ferro_validos,
    COUNT(CASE WHEN ferritina_pre > 0 THEN 1 END) as ferritina_validos,
    COUNT(CASE WHEN albumina_pre > 0 THEN 1 END) as albumina_validos
FROM exames_laboratoriais;

-- =====================================================
-- RESTAURAÇÃO (SE PRECISAR VOLTAR)
-- =====================================================

-- Para restaurar o backup (se necessário):
-- DROP TABLE exames_laboratoriais;
-- ALTER TABLE exames_laboratoriais_backup RENAME TO exames_laboratoriais;
