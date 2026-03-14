# 🧪 TESTE RÁPIDO: Verificar Extração de Laboratoriais

## 🎯 **Objetivo:**
Testar se a API Gemini está conseguindo extrair dados de laboratoriais de um texto simples

## 📝 **Teste Manual:**

### **Passo 1: Build e Executar**
```cmd
npm run build
npm run dev
```

### **Passo 2: Teste com Texto Simples**
Cole este texto no campo principal:

```
Paciente: João Silva
Data dos exames: 14/08/2024
Fonte: Endocrinologia
Resultados:
Hb 14.2
Plaquetas 350.000
Glicemia 95
TSH 1.5
HDL 45
LDL 120
Triglicerídeos 150
```

### **Passo 3: Extraia e Verifique os Logs**
1. Clique em "Extrair Dados"
2. Abra F12 → Console
3. Procure por estes logs:

## 🔍 **Logs Esperados:**

### **Se funcionar:**
```
=== Iniciando extração de laboratoriais ===
Paciente: João Silva
Item para processar: { text: "Paciente: João Silva..." }
Resposta recebida da Gemini API: Sucesso
Dados brutos recebidos: {"exames_laboratoriais":{"data_lab_pre":"14/08/2024","fonte_lab_pre":"Endocrinologia","hb_pre":14.2,"plaquetas_pre":350000,...}}
JSON parseado com sucesso
=== DEBUG DOS DADOS EXTRAÍDOS ===
examesData bruto: {data_lab_pre: "14/08/2024", fonte_lab_pre: "Endocrinologia", hb_pre: 14.2, plaquetas_pre: 350000, ...}
hb_pre: 14.2 (tipo: number)
plaquetas_pre: 350000 (tipo: number)
...
=== DEBUG DOS DADOS SANITIZADOS ===
sanitizedData: {data_lab_pre: "14/08/2024", fonte_lab_pre: "Endocrinologia", hb_pre: 14.2, plaquetas_pre: 350000, ...}
Tem dados laboratoriais? true
Laboratoriais salvos com sucesso para paciente: João Silva
```

### **Se não encontrar dados:**
```
=== DEBUG DOS DADOS EXTRAÍDOS ===
examesData bruto: {}
=== DEBUG DOS DADOS SANITIZADOS ===
sanitizedData: {data_lab_pre: "", fonte_lab_pre: ""}
Tem dados laboratoriais? false
Nenhum dado laboratorial encontrado para salvar
```

### **Se API falhar:**
```
Resposta recebida da Gemini API: Falha
Erro detalhado na extração de exames laboratoriais: {...}
```

## 🚨 **Análise dos Possíveis Problemas:**

### **Problema 1: Gemini Não Encontra Dados**
**Sintomas:** `examesData bruto: {}`
**Causa:** Prompt muito específico ou texto em formato não reconhecido
**Solução:** Melhorar prompt com mais exemplos

### **Problema 2: Validação Muito Rigorosa**
**Sintomas:** Valores extraídos mas rejeitados
```
⚠️ Valor rejeitado para hb_pre: 14.2 (motivo: isValidLabValue)
```
**Causa:** Função `isValidLabValue` muito restritiva
**Solução:** Relaxar critérios de validação

### **Problema 3: Formato JSON Inválido**
**Sintomas:** `Failed to parse JSON response`
**Causa:** Gemini retornando formato inválido
**Solução:** Melhorar tratamento de resposta

### **Problema 4: API Gemini Indisponível**
**Sintomas:** Erro 503 ou 404
**Causa:** Problema com API ou chave inválida
**Solução:** Verificar configuração da API

## 🎯 **Ações Imediatas:**

1. **Execute o teste** com o texto simples acima
2. **Copie todos os logs** relacionados a laboratoriais
3. **Me envie os logs completos** para análise
4. **Com base nos resultados, aplicarei a solução correta**

## 📋 **O Que Procurar nos Logs:**

- ✅ `Resposta recebida da Gemini API: Sucesso`
- ✅ `Dados brutos recebidos:` (deve mostrar JSON)
- ✅ `examesData bruto:` (deve mostrar dados extraídos)
- ✅ `=== DEBUG DOS DADOS EXTRAÍDOS ===`
- ✅ `=== DEBUG DOS DADOS SANITIZADOS ===`
- ❓ `Tem dados laboratoriais?` (true/false)
- ❓ `⚠️ Valor rejeitado` (se aparecer)

**Execute este teste simples e me diga exatamente o que aparece no console! 🎯**
