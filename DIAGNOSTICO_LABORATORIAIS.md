# 🔍 DIAGNÓSTICO: Extração de Laboratoriais Não Funcionando

## 🚨 **Problema Identificado:**

**Sintoma:** Extração completa com 9 prontuários não coletou dados de exames laboratoriais

**Possíveis Causas:**
1. ❌ API Gemini não encontrando dados de laboratoriais nos textos
2. ❌ Validação muito rigorosa descartando valores válidos
3. ❌ Formato dos dados incompatível com extração
4. ❌ Erro silencioso no processo de extração

## 🔍 **Análise do Código Atual:**

### **1. Fluxo de Extração de Laboratoriais:**

```typescript
// No handleProcess (App.tsx)
const examesLaboratoriais = await extractExamesLaboratoriais(itemsToProcess[i]);

// Verificação de dados
const hasLabData = Object.values(examesLaboratoriais).some(val => 
  val !== null && val !== undefined && val !== ''
);

if (hasLabData) {
  // Salva no Supabase
} else {
  // Não salva (provavelmente o que está acontecendo)
}
```

### **2. Validação Rigorosa (examesLaboratoriaisService.ts):**

```typescript
const isValidLabValue = (value: any, fieldName?: string): boolean => {
  // Deve ser número
  if (typeof value !== 'number') return false;
  
  // Não pode ser valores inválidos comuns
  if (value === -0.5 || value === -1 || value === 0 && value !== 0) return false;
  
  // Valores razoáveis para exames laboratoriais
  if (value < 0) return false; // Exames não podem ser negativos
  
  // Limites máximos específicos
  switch (fieldName) {
    case 'plaquetas_pre': return value <= 1000000;
    case 'hb_pre': return value <= 25;
    // ... outros limites
  }
};
```

## 🧪 **Logs Adicionados para Debug:**

Adicionei logs detalhados no App.tsx para mostrar:

```typescript
console.log('=== Iniciando extração de laboratoriais ===');
console.log('Paciente:', pacienteNormalizado.nome);
console.log('Item para processar:', itemsToProcess[i]);
console.log('Exames laboratoriais extraídos:', examesLaboratoriais);
console.log('Tem dados laboratoriais?', hasLabData);
```

## 🎯 **Como Diagnosticar Agora:**

### **Passo 1: Executar Extração com Logs**

```cmd
npm run build
npm run dev
```

1. Cole os 9 prontuários novamente
2. Clique em "Extrair Dados"
3. Abra F12 → Console
4. Procure pelos logs de laboratoriais

### **Passo 2: Analisar os Logs**

#### **Logs Esperados se funcionar:**
```
=== Iniciando extração de laboratoriais ===
Paciente: [Nome do Paciente 1]
Item para processar: { text: "..." } ou { file: {...} }
Exames laboratoriais extraídos: { hb_pre: 14.2, plaquetas_pre: 350000, ... }
Tem dados laboratoriais? true
Laboratoriais salvos com sucesso para paciente: [Nome]
```

#### **Logs Possíveis se não funcionar:**
```
=== Iniciando extração de laboratoriais ===
Paciente: [Nome do Paciente 1]
Exames laboratoriais extraídos: {}
Tem dados laboratoriais? false
Nenhum dado laboratorial encontrado para salvar
```

#### **Logs de Erro:**
```
Erro na extração de laboratoriais: [erro específico]
```

### **Passo 3: Verificar Logs do Gemini**

No serviço de laboratoriais, já existem logs:
```
Resposta recebida da Gemini API: Sucesso/Falha
Dados brutos recebidos: [primeiros 200 caracteres]
JSON parseado com sucesso
```

## 🚨 **Cenários Possíveis:**

### **Cenário 1: Gemini Não Encontra Dados**
```
Exames laboratoriais extraídos: {}
```
**Causa:** Textos não contêm dados de exames ou formato não reconhecido
**Solução:** Melhorar prompt ou adicionar mais abreviações

### **Cenário 2: Validação Muito Rigorosa**
```
Exames laboratoriais extraídos: { hb_pre: undefined, plaquetas_pre: undefined }
```
**Causa:** Valores extraídos não passaram na validação
**Solução:** Ajustar critérios de validação

### **Cenário 3: Formato Incompatível**
```
Dados brutos recebidos: [texto não JSON]
JSON parse failed
```
**Causa:** Gemini retornou formato inválido
**Solução:** Melhorar tratamento de resposta

### **Cenário 4: Erro na API**
```
Erro na extração de laboratoriais: [erro da API]
```
**Causa:** Problema com chave da API ou limite
**Solução:** Verificar configuração da API

## 🛠️ **Soluções Possíveis:**

### **Solução 1: Relaxar Validação**
```typescript
// Menos rigoroso
const isValidLabValue = (value: any, fieldName?: string): boolean => {
  if (typeof value !== 'number') return false;
  if (value === null || value === undefined) return false;
  if (isNaN(value)) return false;
  
  // Aceitar valores positivos razoáveis
  return value > 0 && value <= 1000000;
};
```

### **Solução 2: Melhorar Prompt**
- Adicionar mais exemplos de formatos
- Incluir mais abreviações médicas
- Especificar melhor o que procurar

### **Solução 3: Debug Interativo**
- Mostrar exatamente o que a Gemini retornou
- Comparar com dados esperados
- Ajustar extração baseado nos resultados

## 🎯 **Ações Imediatas:**

1. **Execute a extração com os 9 prontuários**
2. **Copie todos os logs do console relacionados a laboratoriais**
3. **Me envie os logs para análise**
4. **Com base nos logs, aplicarei a solução correta**

## 📋 **O Que Procurar nos Logs:**

- `=== Iniciando extração de laboratoriais ===`
- `Exames laboratoriais extraídos:`
- `Tem dados laboratoriais?`
- `Resposta recebida da Gemini API:`
- `Dados brutos recebidos:`

**Com esses logs vou identificar exatamente onde está o problema e corrigir! 🎯**
