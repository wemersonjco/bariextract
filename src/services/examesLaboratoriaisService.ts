import { GoogleGenAI, Type } from "@google/genai";
import { ExamesLaboratoriais } from "../types";
import { normalizarDatasPaciente } from "../utils/dataUtils";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY || "" });

// Função para validar valores de exames laboratoriais
const isValidLabValue = (value: any, fieldName?: string): boolean => {
  // Deve ser número
  if (typeof value !== 'number') return false;
  
  // Não pode ser nulo ou indefinido
  if (value === null || value === undefined) return false;
  
  // Não pode ser NaN
  if (isNaN(value)) return false;
  
  // Aceitar -1 e -2 como "não encontrado" ou "não realizado"
  if (value === -1 || value === -2) return true; // -1/-2 significa não encontrado, salvar como undefined
  
  // Não pode ser valores inválidos comuns (exceto -1 que já foi tratado)
  if (value === -0.5 || value === 0 && value !== 0) return false;
  
  // Valores razoáveis para exames laboratoriais
  if (value < 0 && value !== -1 && value !== -2) return false; // Outros valores negativos não permitidos
  
  // Limites máximos específicos para cada tipo de exame
  switch (fieldName) {
    case 'plaquetas_pre':
      return value <= 1000000; // Plaquetas: até 1.000.000/mm³
    case 'hb_pre':
      return value <= 25; // Hemoglobina: até 25 g/dL
    case 'glicemia_pre':
      return value <= 500; // Glicemia: até 500 mg/dL
    case 'hba1c_pre':
      return value <= 20; // HbA1c: até 20%
    case 'creatinina_pre':
      return value <= 20; // Creatinina: até 20 mg/dL
    case 'ureia_pre':
      return value <= 200; // Ureia: até 200 mg/dL
    case 'ct_pre':
      return value <= 500; // Colesterol total: até 500 mg/dL
    case 'hdl_pre':
      return value <= 200; // HDL: até 200 mg/dL
    case 'ldl_pre':
      return value <= 400; // LDL: até 400 mg/dL
    case 'tg_pre':
      return value <= 2000; // Triglicerídeos: até 2000 mg/dL
    case 'tgo_pre':
    case 'tgp_pre':
    case 'ggt_pre':
      return value <= 1000; // TGO/TGP/GGT: até 1000 U/L
    case 'vit_b12_pre':
      return value <= 2000; // Vitamina B12: até 2000 pg/mL
    case 'vit_d_pre':
      return value <= 200; // Vitamina D: até 200 ng/mL
    case 'ferro_pre':
      return value <= 500; // Ferro: até 500 µg/dL
    case 'ferritina_pre':
      return value <= 10000; // Ferritina: até 10.000 ng/mL
    case 'tsh_pre':
      return value <= 100; // TSH: até 100 mUI/L
    case 't4l_pre':
      return value <= 100; // T4 livre: até 100 ng/dL
    case 'albumina_pre':
      return value <= 10; // Albumina: até 10 g/dL
    case 'insulina_pre':
      return value <= 1000; // Insulina: até 1000 µUI/mL
    default:
      return value <= 1000000; // Limite geral para outros campos
  }
};

export const extractExamesLaboratoriais = async (
  input: { text?: string, file?: { data: string, mimeType: string } },
  retryCount = 0
): Promise<Partial<ExamesLaboratoriais>> => {
  console.log('Iniciando extração de exames laboratoriais:', { 
    hasText: !!input.text, 
    hasFile: !!input.file, 
    textLength: input.text?.length || 0,
    fileType: input.file?.mimeType 
  });

  const parts: any[] = [];
  
  if (input.file) {
    parts.push({
      inlineData: {
        data: input.file.data,
        mimeType: input.file.mimeType
      }
    });
  }
  
  if (input.text) {
    parts.push({ text: input.text });
  }

  // Verificar se a chave da API está configurada
  if (!import.meta.env.VITE_GEMINI_KEY || import.meta.env.VITE_GEMINI_KEY.trim() === '') {
    console.error('VITE_GEMINI_KEY não está configurada ou está vazia');
    throw new Error('Chave da API Gemini não configurada. Verifique suas variáveis de ambiente.');
  }

  console.log('Chave da API configurada:', import.meta.env.VITE_GEMINI_KEY ? 'Sim' : 'Não');

  const modelToUse = "gemini-3.1-pro-preview";
  
  console.log(`Usando modelo: ${modelToUse} (tentativa ${retryCount + 1})`);

  try {
    console.log('Enviando requisição para Gemini API...');
    
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: {
        parts: [
          ...parts,
          { text: `EXAMES LABORATORIAIS PRÉ-OPERATÓRIOS:

Extraia os resultados dos exames laboratoriais do pré-operatório deste paciente.

FONTE PRINCIPAL: Procure pela consulta de ENDOCRINOLOGIA pré-bariátrica. 
Os exames geralmente estão registrados em formato compacto, por exemplo:
"tsh 1,43  hba1c 5,5  b12 576  tg 91  ct 216  cr 0,85"
"ggt 22  gj 92  tgp 19  hdl 49,2  tgo 18  hb 13,1  plaq 253000"

Se não houver consulta de endocrinologia, procure os exames em outras consultas 
(cirurgia bariátrica, clínica médica, gastroenterologia).

Se houver MÚLTIPLOS momentos de exames pré-operatórios, utilize o MAIS RECENTE 
antes da data da cirurgia. Registre a data dos exames e a fonte (especialidade).

Para cada exame, extraia APENAS O VALOR NUMÉRICO.

ATENÇÃO com abreviações usadas nos prontuários:
- "Hb" ou "HB" = Hemoglobina
- "Plaq" ou "Pt" ou "Plaquetas" = Plaquetas
- "TGO" ou "AST" = TGO
- "TGP" ou "ALT" = TGP
- "GGT" ou "Gama GT" ou "GGt" = GGT
- "GJ" ou "Glicemia" ou "Glicose" = Glicemia de jejum
- "Hb glic" ou "HbA1c" ou "A1C" ou "Hemoglobina glicada" = HbA1c
- "Cr" ou "CR" ou "Creatinina" = Creatinina
- "Ur" ou "Ureia" = Ureia
- "CT" ou "Colesterol" = Colesterol Total
- "HDL" = HDL
- "LDL" = LDL
- "TG" ou "Trig" ou "Triglicerídeos" = Triglicerídeos
- "B12" ou "VitB12" ou "Vitamina B12" = Vitamina B12
- "VitD" ou "25OHD" ou "25-OH" ou "Vitamina D" = Vitamina D
- "Fe" ou "Ferro" = Ferro sérico
- "Ferrit" ou "Ferritina" ou "ferrritina" (com typo) = Ferritina
- "TSH" = TSH
- "T4L" ou "T4l" ou "T4 livre" = T4 Livre
- "Alb" ou "Albumina" = Albumina
- "Ins" ou "Insulina" = Insulina

ATENÇÃO com valores especiais:
- Se o valor tiver asterisco (ex: "GJ 119 *"), extraia o número sem o asterisco
- Se o valor estiver cortado (ex: "25ohd 19,**"), extraia como null
- Plaquetas podem vir como número absoluto (253000) ou abreviado (253)
  → Se o valor for menor que 1000, multiplicar por 1000 (ex: 253 → 253000)

Se o exame não estiver disponível no prontuário, retorne null.

Formate datas como DD/MM/AAAA.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            exames_laboratoriais: {
              type: Type.OBJECT,
              properties: {
                data_lab_pre: { type: Type.STRING },
                fonte_lab_pre: { type: Type.STRING },
                hb_pre: { type: Type.NUMBER },
                plaquetas_pre: { type: Type.NUMBER },
                tgo_pre: { type: Type.NUMBER },
                tgp_pre: { type: Type.NUMBER },
                ggt_pre: { type: Type.NUMBER },
                glicemia_pre: { type: Type.NUMBER },
                hba1c_pre: { type: Type.NUMBER },
                creatinina_pre: { type: Type.NUMBER },
                ureia_pre: { type: Type.NUMBER },
                ct_pre: { type: Type.NUMBER },
                hdl_pre: { type: Type.NUMBER },
                ldl_pre: { type: Type.NUMBER },
                tg_pre: { type: Type.NUMBER },
                vit_b12_pre: { type: Type.NUMBER },
                vit_d_pre: { type: Type.NUMBER },
                ferro_pre: { type: Type.NUMBER },
                ferritina_pre: { type: Type.NUMBER },
                tsh_pre: { type: Type.NUMBER },
                t4l_pre: { type: Type.NUMBER },
                albumina_pre: { type: Type.NUMBER },
                insulina_pre: { type: Type.NUMBER }
              }
            }
          }
        },
      },
    });

    console.log('Resposta recebida da Gemini API:', response ? 'Sucesso' : 'Falha');
    
    const rawData = response.text || "{}";
    console.log('Dados brutos recebidos:', rawData.substring(0, 200) + '...');
    
    // Parse and validate response
    let parsedData;
    try {
      parsedData = JSON.parse(rawData);
      console.log('JSON parseado com sucesso');
    } catch (parseError) {
      console.error("Failed to parse JSON response from Gemini:", parseError);
      console.error("Raw response:", rawData);
      return {};
    }

    // Extract the exames_laboratoriais object
    const examesData = parsedData.exames_laboratoriais || {};
    
    console.log('=== DEBUG DOS DADOS EXTRAÍDOS ===');
    console.log('examesData bruto:', examesData);
    
    // Log each field value for debugging
    Object.keys(examesData).forEach(key => {
      console.log(`${key}:`, examesData[key], `(tipo: ${typeof examesData[key]})`);
    });
    
    // Sanitize and normalize data
    const sanitizedData: Partial<ExamesLaboratoriais> = {
      data_lab_pre: (typeof examesData.data_lab_pre === 'string' ? examesData.data_lab_pre.trim() : '') || '',
      fonte_lab_pre: (typeof examesData.fonte_lab_pre === 'string' ? examesData.fonte_lab_pre.trim() : '') || '',
      hb_pre: isValidLabValue(examesData.hb_pre, 'hb_pre') ? examesData.hb_pre : undefined,
      plaquetas_pre: isValidLabValue(examesData.plaquetas_pre, 'plaquetas_pre') ? examesData.plaquetas_pre : undefined,
      tgo_pre: isValidLabValue(examesData.tgo_pre, 'tgo_pre') ? examesData.tgo_pre : undefined,
      tgp_pre: isValidLabValue(examesData.tgp_pre, 'tgp_pre') ? examesData.tgp_pre : undefined,
      ggt_pre: isValidLabValue(examesData.ggt_pre, 'ggt_pre') ? examesData.ggt_pre : undefined,
      glicemia_pre: isValidLabValue(examesData.glicemia_pre, 'glicemia_pre') ? examesData.glicemia_pre : undefined,
      hba1c_pre: isValidLabValue(examesData.hba1c_pre, 'hba1c_pre') ? examesData.hba1c_pre : undefined,
      creatinina_pre: isValidLabValue(examesData.creatinina_pre, 'creatinina_pre') ? examesData.creatinina_pre : undefined,
      ureia_pre: isValidLabValue(examesData.ureia_pre, 'ureia_pre') ? examesData.ureia_pre : undefined,
      ct_pre: isValidLabValue(examesData.ct_pre, 'ct_pre') ? examesData.ct_pre : undefined,
      hdl_pre: isValidLabValue(examesData.hdl_pre, 'hdl_pre') ? examesData.hdl_pre : undefined,
      ldl_pre: isValidLabValue(examesData.ldl_pre, 'ldl_pre') ? examesData.ldl_pre : undefined,
      tg_pre: isValidLabValue(examesData.tg_pre, 'tg_pre') ? examesData.tg_pre : undefined,
      vit_b12_pre: isValidLabValue(examesData.vit_b12_pre, 'vit_b12_pre') ? examesData.vit_b12_pre : undefined,
      vit_d_pre: isValidLabValue(examesData.vit_d_pre, 'vit_d_pre') ? examesData.vit_d_pre : undefined,
      ferro_pre: isValidLabValue(examesData.ferro_pre, 'ferro_pre') ? examesData.ferro_pre : undefined,
      ferritina_pre: isValidLabValue(examesData.ferritina_pre, 'ferritina_pre') ? examesData.ferritina_pre : undefined,
      tsh_pre: isValidLabValue(examesData.tsh_pre, 'tsh_pre') ? examesData.tsh_pre : undefined,
      t4l_pre: isValidLabValue(examesData.t4l_pre, 't4l_pre') ? examesData.t4l_pre : undefined,
      albumina_pre: isValidLabValue(examesData.albumina_pre, 'albumina_pre') ? examesData.albumina_pre : undefined,
      insulina_pre: isValidLabValue(examesData.insulina_pre, 'insulina_pre') ? examesData.insulina_pre : undefined
    };
    
    console.log('=== DEBUG DOS DADOS SANITIZADOS ===');
    console.log('sanitizedData:', sanitizedData);
    
    // Check what was rejected
    Object.keys(examesData).forEach(key => {
      const originalValue = examesData[key];
      const sanitizedValue = sanitizedData[key as keyof typeof sanitizedData];
      if (originalValue !== null && originalValue !== undefined && sanitizedValue === undefined) {
        console.log(`⚠️ Valor rejeitado para ${key}:`, originalValue, '(motivo: isValidLabValue)');
      }
    });

    // Normalizar datas para formato DD/MM/YYYY
    const dadosNormalizados = normalizarDatasPaciente(sanitizedData);

    return dadosNormalizados;

  } catch (error: any) {
    console.error('Erro detalhado na extração de exames laboratoriais:', {
      message: error.message,
      status: error.status,
      stack: error.stack,
      name: error.name
    });
    
    // Handle model unavailable (503) - high demand
    if (error.status === 503 || error.message?.includes("UNAVAILABLE") || error.message?.includes("high demand")) {
      console.log('Modelo indisponível, tentando novamente...');
      if (retryCount < 5) {
        const waitTime = Math.min(30000, 3000 * Math.pow(2, retryCount)); // Exponential backoff, max 30s
        console.log(`Aguardando ${waitTime}ms antes da tentativa ${retryCount + 2}...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return extractExamesLaboratoriais(input, retryCount + 1);
      }
    }
    
    // Handle model not found (404)
    if (error.status === 404 || error.message?.includes("NOT_FOUND") || error.message?.includes("not found")) {
      console.error('Modelo não encontrado:', error.message);
      throw new Error('Nenhum modelo Gemini disponível foi encontrado. Isso pode ser um problema temporário da API. Tente novamente em alguns minutos.');
    }
    
    // Handle invalid API key (401)
    if (error.status === 401 || error.message?.includes("PERMISSION_DENIED") || error.message?.includes("invalid")) {
      console.error('Chave da API inválida:', error.message);
      throw new Error('Chave da API Gemini inválida ou expirada. Verifique sua chave e tente novamente.');
    }
    
    // Handle quota exceeded (429)
    if (error.status === 429 || error.message?.includes("RESOURCE_EXHAUSTED") || error.message?.includes("quota")) {
      console.error('Limite de uso excedido:', error.message);
      throw new Error('Limite de uso do Gemini atingido. Por favor, aguarde um momento e tente novamente com menos arquivos.');
    }
    
    // Handle network errors
    if (error.message?.includes("NETWORK_ERROR") || error.message?.includes("fetch")) {
      console.error('Erro de conexão:', error.message);
      throw new Error('Erro de conexão com a API. Verifique sua conexão com a internet e tente novamente.');
    }
    
    // Generic error
    console.error('Erro genérico:', error.message);
    throw new Error('Erro ao processar exames laboratoriais. Verifique sua conexão ou chave de API.');
  }
};
