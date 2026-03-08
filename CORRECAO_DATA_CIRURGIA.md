# 🔧 ERRO CORRIGIDO: data_cirurgia vs dataCirurgia

## 🚨 **Problema Identificado**

O erro `coluna pacientes.dataCirurgia não existe` ocorreu porque:

- **Banco de dados**: usa `data_cirurgia` (snake_case)
- **Código TypeScript**: usava `dataCirurgia` (camelCase)

## ✅ **Correções Aplicadas**

### 1. **Serviço Supabase**
- Criado tipo `PacienteSimples` com campo `data_cirurgia`
- Atualizado `getPacientesSemLaboratoriais()` para usar tipo correto
- Mantido compatibilidade com banco de dados

### 2. **Componente ExtraçãoComplementar**
- Atualizado para usar `data_cirurgia` na exibição
- Corrigida referência no template JSX

## 🧪 **Como Testar Agora**

```cmd
npm run build
npm run dev
```

1. Abra **http://localhost:3000**
2. Clique em **"Extração Complementar (Laboratoriais)"**
3. **Deve funcionar sem erros!**

## 📋 **Verificação**

- ✅ Consulta SQL agora usa `data_cirurgia`
- ✅ Tipo TypeScript compatível
- ✅ Componente exibe campo correto
- ✅ Sem mais erros de coluna não existe

**O erro foi corrigido! Teste novamente a extração complementar. 🎉**
