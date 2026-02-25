# Como configurar a API Gemini

## ✅ Problema Resolvido: API Configurada
A API Gemini agora está configurada corretamente!

## 🔄 Novo Problema: Erro 503 (Alta Demanda)

### Causa
O erro `{"error":{"code":503,"message":"This model is currently experiencing high demand"}}` indica que o modelo Gemini está temporariamente sobrecarregado.

### 🛠️ Soluções Implementadas

1. **Retry Automático Inteligente**
   - Até 5 tentativas com backoff exponencial
   - Intervalos: 3s, 6s, 12s, 24s, 30s (máximo)
   - Feedback visual na interface durante as tentativas

2. **Fallback de Modelos**
   - Tentativa 1-2: `gemini-3.1-pro-preview` (modelo principal)
   - Tentativa 3-5: `gemini-1.5-pro` (modelo alternativo)
   - Mudança automática se o principal estiver indisponível

3. **Interface Melhorada**
   - Status visual das tentativas de retry
   - Mensagens específicas para cada tipo de erro
   - Indicadores de progresso durante o processamento

### 📋 Como Proceder

1. **Aguarde as tentativas automáticas** - O sistema tentará novamente sozinho
2. **Se falhar após 5 tentativas**, espere alguns minutos e tente novamente
3. **Evite horários de pico** - Geralmente o modelo fica mais estável fora dos horários comerciais

### 🎯 Melhorias Técnicas

- **Logging detalhado** para debugging
- **Tratamento específico** para erro 503
- **Backoff exponencial** para não sobrecarregar a API
- **Múltiplos modelos** como fallback
- **Interface responsiva** com feedback em tempo real

### 💡 Dicas

- O erro 503 é **temporário** e geralmente resolve em alguns minutos
- O sistema agora **recupera automaticamente** na maioria dos casos
- Use o **console do navegador** para acompanhar as tentativas em tempo real

## Configuração Original (se necessário)

### 1. Obtenha sua chave da API Gemini
1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

### 2. Configure a variável de ambiente
1. Abra o arquivo `.env` na raiz do projeto
2. Substitua a linha existente por:
   ```
   GEMINI_API_KEY=sua_chave_api_aqui
   ```
3. Salve o arquivo

### 3. Reinicie o servidor
1. Pare o servidor atual (Ctrl+C)
2. Execute novamente:
   ```bash
   npm run dev
   ```

## Status Atual: ✅ API Configurada | 🔄 Tratando 503 Automaticamente
