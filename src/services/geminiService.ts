import { GoogleGenAI, Type } from "@google/genai";
import { PatientData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const extractPatientData = async (
  input: { text?: string, file?: { data: string, mimeType: string } },
  retryCount = 0
): Promise<Partial<PatientData>> => {
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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          ...parts,
          { text: `Extraia os dados do prontuário médico acima para pesquisa clínica sobre cirurgia bariátrica. 
          Siga rigorosamente estas regras:
          1. NÃO crie dados. Se uma informação não estiver explícita, deixe o campo vazio ("").
          2. Formate datas como DD/MM/AAAA.
          3. Formate números decimais com ponto ou vírgula conforme o padrão médico brasileiro (ex: 1,75m ou 1.75m).
          4. Para campos de Sim/Não, use "Sim", "Não" ou vazio.
          
          REGRAS DE INTERPRETAÇÃO DE ABREVIAÇÕES:
          - "NL. HP-" ou "HP-" -> H. Pylori: "Negativo", Achados: "Normal"
          - "NL. HP+" ou "HP+" -> H. Pylori: "Positivo", Achados: "Normal"
          - "URE+" ou "Urease+" -> Urease: "Positivo"
          - "URE-" ou "Urease-" -> Urease: "Negativo"
          - "NL" isolado -> "Normal"
          - "VB NL" -> Vesícula Biliar: "Vesícula presente e normal"
          - "Colel." ou "colelitíase" -> Vesícula Biliar: "Colelitíase"

          REGRAS ESPECÍFICAS DE CÁLCULO E EXTRAÇÃO:
          - Data Emissão AIH: Identifique a data da consulta onde consta expressamente o termo "emito aih" ou similar.
          - Variação Peso Pré-op (kg): Calcule a diferença entre o "Peso Último Pré-op" e o "Peso Inicial".
          - % Excesso Peso Perdido: Calcule o percentual de peso perdido em relação ao peso inicial. Fórmula: ((Peso Inicial - Peso Último Pré-op) / Peso Inicial) * 100. Retorne o valor numérico (ex: 15.5) no campo "percentExcessoPesoPerdido".
          - Último IMC: Calcule o IMC baseado no último peso registrado e na altura. Fórmula: Peso / (Altura * Altura).
          
          DADOS PÓS-OPERATÓRIOS:
          - Extraia dados de EDA e USG realizados APÓS a data da cirurgia.
          - Para EDA Pós: Identifique data, urease, H. Pylori e achados.
          - Para USG Pós: Identifique data, situação da vesícula e observações.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            num: { type: Type.STRING },
            nome: { type: Type.STRING },
            prontuario: { type: Type.STRING },
            sexo: { type: Type.STRING },
            idadePrimeiraConsulta: { type: Type.STRING },
            municipio: { type: Type.STRING },
            estadoCivil: { type: Type.STRING },
            numFilhos: { type: Type.STRING },
            ocupacao: { type: Type.STRING },
            escolaridade: { type: Type.STRING },
            cuidadorPosOp: { type: Type.STRING },
            dataPrimeiraConsulta: { type: Type.STRING },
            dataEmissaoAIH: { type: Type.STRING },
            tempoProtocolo: { type: Type.STRING },
            dataCirurgia: { type: Type.STRING },
            idadeNaCirurgia: { type: Type.STRING },
            tipoCirurgia: { type: Type.STRING },
            pesoInicial: { type: Type.STRING },
            pesoUltimoPreOp: { type: Type.STRING },
            variacaoPesoPreOp: { type: Type.STRING },
            altura: { type: Type.STRING },
            imcInicial: { type: Type.STRING },
            imcUltimoPreOp: { type: Type.STRING },
            expectativaPeso: { type: Type.STRING },
            perdaEsperada: { type: Type.STRING },
            tabagismo: { type: Type.STRING },
            etilismo: { type: Type.STRING },
            atividadeFisicaPre: { type: Type.STRING },
            comerEmocional: { type: Type.STRING },
            autoavaliacaoPsicologica: { type: Type.STRING },
            obesidadeDesde: { type: Type.STRING },
            tentativasEmagrecimento: { type: Type.STRING },
            cirurgiasPrevias: { type: Type.STRING },
            has: { type: Type.STRING },
            dm2: { type: Type.STRING },
            dislipidemia: { type: Type.STRING },
            esteatoseHepatica: { type: Type.STRING },
            colelitiasePre: { type: Type.STRING },
            asma: { type: Type.STRING },
            outrasComorbidades: { type: Type.STRING },
            medicacoesEmUso: { type: Type.STRING },
            hPyloriResultado: { type: Type.STRING },
            hPyloriSituacao: { type: Type.STRING },
            edaResultado: { type: Type.STRING },
            fezColonoscopia: { type: Type.STRING },
            resultadoColonoscopia: { type: Type.STRING },
            outrasAlteracoesGI: { type: Type.STRING },
            usgAbdome: { type: Type.STRING },
            espirometriaResultado: { type: Type.STRING },
            rxTorax: { type: Type.STRING },
            ecoFE: { type: Type.STRING },
            ecoPSAP: { type: Type.STRING },
            ecoOutrasAlteracoes: { type: Type.STRING },
            riscoPulmonar: { type: Type.STRING },
            riscoCV: { type: Type.STRING },
            clexaneDose: { type: Type.STRING },
            hbA1c: { type: Type.STRING },
            glicemiaJejum: { type: Type.STRING },
            tsh: { type: Type.STRING },
            t4Livre: { type: Type.STRING },
            b12: { type: Type.STRING },
            vitaminaD: { type: Type.STRING },
            colesterolTotal: { type: Type.STRING },
            hdl: { type: Type.STRING },
            ldl: { type: Type.STRING },
            triglicerideos: { type: Type.STRING },
            tgo: { type: Type.STRING },
            tgp: { type: Type.STRING },
            pesoPO9dias: { type: Type.STRING },
            pesoPO40dias: { type: Type.STRING },
            pesoPO4_5meses: { type: Type.STRING },
            pesoPO5meses: { type: Type.STRING },
            pesoPO7meses: { type: Type.STRING },
            pesoPO11meses: { type: Type.STRING },
            peso1AnoPO: { type: Type.STRING },
            perdaAbsoluta1Ano: { type: Type.STRING },
            percentExcessoPesoPerdido: { type: Type.STRING },
            atividadeFisica1AnoPO: { type: Type.STRING },
            excessoPele: { type: Type.STRING },
            complicacoesPO: { type: Type.STRING },
            adesaoSuplementacao: { type: Type.STRING },
            altaCB: { type: Type.STRING },
            observacoesClinicas: { type: Type.STRING },
            ultimoIMC: { type: Type.STRING },
            edaPosData: { type: Type.STRING },
            edaPosUrease: { type: Type.STRING },
            edaPosHPylori: { type: Type.STRING },
            edaPosAchados: { type: Type.STRING },
            usgPosData: { type: Type.STRING },
            usgPosVesicula: { type: Type.STRING },
            usgPosObservacoes: { type: Type.STRING },
          },
        },
      },
    });

    const rawData = response.text || "{}";
    
    // Parse and validate the response
    let parsedData;
    try {
      parsedData = JSON.parse(rawData);
    } catch (parseError) {
      console.error("Failed to parse JSON response from Gemini:", parseError);
      return {};
    }

    // Sanitize all string values to prevent null/undefined issues
    const sanitizedData: Partial<PatientData> = {};
    const stringFields = [
      'num', 'nome', 'prontuario', 'sexo', 'idadePrimeiraConsulta', 'municipio', 
      'estadoCivil', 'numFilhos', 'ocupacao', 'escolaridade', 'cuidadorPosOp',
      'dataPrimeiraConsulta', 'dataEmissaoAIH', 'tempoProtocolo', 'dataCirurgia',
      'idadeNaCirurgia', 'tipoCirurgia', 'pesoInicial', 'pesoUltimoPreOp',
      'variacaoPesoPreOp', 'altura', 'imcInicial', 'imcUltimoPreOp', 'expectativaPeso',
      'perdaEsperada', 'tabagismo', 'etilismo', 'atividadeFisicaPre', 'comerEmocional',
      'autoavaliacaoPsicologica', 'obesidadeDesde', 'tentativasEmagrecimento',
      'cirurgiasPrevias', 'has', 'dm2', 'dislipidemia', 'esteatoseHepatica',
      'colelitiasePre', 'asma', 'outrasComorbidades', 'medicacoesEmUso',
      'hPyloriResultado', 'hPyloriSituacao', 'edaResultado', 'fezColonoscopia',
      'resultadoColonoscopia', 'outrasAlteracoesGI', 'usgAbdome', 'espirometriaResultado',
      'rxTorax', 'ecoFE', 'ecoPSAP', 'ecoOutrasAlteracoes', 'riscoPulmonar', 'riscoCV',
      'clexaneDose', 'hbA1c', 'glicemiaJejum', 'tsh', 't4Livre', 'b12', 'vitaminaD',
      'colesterolTotal', 'hdl', 'ldl', 'triglicerideos', 'tgo', 'tgp', 'pesoPO9dias',
      'pesoPO40dias', 'pesoPO4_5meses', 'pesoPO5meses', 'pesoPO7meses', 'pesoPO11meses',
      'peso1AnoPO', 'perdaAbsoluta1Ano', 'percentExcessoPesoPerdido',
      'atividadeFisica1AnoPO', 'excessoPele', 'complicacoesPO', 'adesaoSuplementacao',
      'altaCB', 'observacoesClinicas', 'ultimoIMC', 'edaPosData', 'edaPosUrease',
      'edaPosHPylori', 'edaPosAchados', 'usgPosData', 'usgPosVesicula', 'usgPosObservacoes'
    ];

    stringFields.forEach(field => {
      const value = parsedData[field];
      sanitizedData[field as keyof PatientData] = (typeof value === 'string' ? value.trim() : '') || '';
    });

    return sanitizedData;
  } catch (error: any) {
    // Handle quota exceeded (429)
    if (error.message?.includes("429") || error.status === 429 || error.message?.includes("RESOURCE_EXHAUSTED")) {
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s
        console.warn(`Quota exceeded. Retrying in ${delay}ms... (Attempt ${retryCount + 1})`);
        await sleep(delay);
        return extractPatientData(input, retryCount + 1);
      }
    }
    
    console.error("Failed to extract patient data", error);
    throw error;
  }
};
