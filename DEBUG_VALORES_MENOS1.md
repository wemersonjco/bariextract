# 🔍 DEBUG: Identificando Onde os -1 Aparecem

## 🚨 **Problema:**
Ainda está retornando `-1` nos exames laboratoriais mesmo após a correção.

## 🧪 **Teste Necessário:**

### **Passo 1: Build e Executar**
```cmd
npm run build
npm run dev
```

### **Passo 2: Executar Extração**
1. Cole um prontuário com dados faltantes
2. Clique em "Extrair Dados"
3. Abra F12 → Console
4. **Copie todos os logs relacionados a laboratoriais**

## 📋 **Logs Específicos para Procurar:**

### **1. Dados Brutos da Gemini:**
```
Dados brutos recebidos: {
  "exames_laboratoriais": {
    "ggt_pre": -1,
    "ferritina_pre": -1,
    "hb_pre": 14.5,
    ...
  }
}
```

### **2. Debug dos Dados Extraídos:**
```
=== DEBUG DOS DADOS EXTRAÍDOS ===
examesData bruto: {ggt_pre: -1, ferritina_pre: -1, hb_pre: 14.5, ...}
ggt_pre: -1 (tipo: number)
ferritina_pre: -1 (tipo: number)
hb_pre: 14.5 (tipo: number)
```

### **3. Debug dos Dados Sanitizados:**
```
=== DEBUG DOS DADOS SANITIZADOS ===
sanitizedData: {ggt_pre: undefined, ferritina_pre: undefined, hb_pre: 14.5, ...}
```

### **4. DADOS FINAIS (IMPORTANTE):**
```
=== DADOS FINAIS PARA SALVAR ===
dadosFinais: {ggt_pre: undefined, ferritina_pre: undefined, hb_pre: 14.5, ...}
✅ Nenhum valor -1 encontrado nos dados finais
```

**OU (se houver problema):**
```
=== DADOS FINAIS PARA SALVAR ===
dadosFinais: {ggt_pre: -1, ferritina_pre: -1, hb_pre: 14.5, ...}
🚨 ATENÇÃO: Ainda há valores -1 nos dados finais!
❌ -1 encontrado em: ggt_pre
❌ -1 encontrado em: ferritina_pre
```

## 🎯 **Análise dos Possíveis Resultados:**

### **Cenário 1: Logs Corretos mas -1 Ainda Aparece**
Se os logs mostrarem `✅ Nenhum valor -1 encontrado nos dados finais` mas ainda aparece `-1` na interface, o problema pode ser:
- **Cache do navegador** (recarregue com Ctrl+F5)
- **Outro lugar no código** salvando os dados
- **Visualização incorreta** dos dados

### **Cenário 2: Logs Mostram -1 nos Dados Finais**
Se os logs mostrarem `🚨 ATENÇÃO: Ainda há valores -1 nos dados finais!`, o problema está:
- **Em outra função** que não está sendo validada
- **Em outro fluxo** de extração
- **No salvamento direto** sem passar pela validação

### **Cenário 3: Logs Mostram Validação Correta**
Se os logs mostrarem que `-1` foi rejeitado corretamente, mas ainda aparece, pode ser:
- **Problema no banco de dados** (dados antigos)
- **Problema na exibição** (frontend)
- **Problema em outra extração** (complementar)

## 🔧 **Ações Com Base nos Logs:**

### **Se aparecer "✅ Nenhum valor -1 encontrado":**
1. Recarregar página com Ctrl+F5
2. Verificar se são dados antigos no banco
3. Testar com novo prontuário

### **Se aparecer "🚨 ATENÇÃO: Ainda há valores -1":**
1. Identificar onde os `-1` estão sendo salvos
2. Corrigir a função específica
3. Adicionar mais validação

### **Se os logs estiverem corretos:**
1. Limpar cache do navegador
2. Verificar banco de dados diretamente
3. Testar fluxo completo

## 📋 **Me Informe:**

**Execute a extração e me envie:**
1. **Todos os logs de laboratoriais** do console
2. **Se aparece `-1` na interface**
3. **Se aparece `-1` no banco de dados**

**Com esses dados vou identificar e corrigir o problema exato! 🎯**
