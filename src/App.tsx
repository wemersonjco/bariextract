/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Plus, 
  Search, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Database,
  ClipboardList,
  Share2,
  ExternalLink,
  LayoutDashboard,
  Users,
  Edit3,
  Save,
  X,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Activity,
  History,
  Calendar,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { format, differenceInMonths, differenceInYears, parse } from 'date-fns';
import { PatientData, CSV_HEADERS, ExamesLaboratoriais } from './types';
import { extractPatientData } from './services/geminiService';
import { extractExamesLaboratoriais } from './services/examesLaboratoriaisService';
import { normalizarDatasPaciente } from './utils/dataUtils';
import { supabase, isSupabaseConfigured } from './services/supabaseService';
import { 
  getPacientesSemLaboratoriais,
  saveExamesLaboratoriais,
  checkPacienteTemLaboratoriais,
  getExamesLaboratoriais
} from './services/examesSupabaseService';
import ExtraçãoComplementar from './components/ExtraçãoComplementar';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
);

type Tab = 'dashboard' | 'patients';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('patients');
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<PatientData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRecord, setCurrentRecord] = useState('');
  const [currentFiles, setCurrentFiles] = useState<{ data: string, mimeType: string, name: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [retryStatus, setRetryStatus] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExtraçãoComplementar, setShowExtraçãoComplementar] = useState(false);
  const [extractionMode, setExtractionMode] = useState<'completa' | 'complementar'>('completa');

  // Load patients from Supabase
  React.useEffect(() => {
    const loadPatients = async () => {
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Map snake_case to camelCase
        const mappedData = (data || []).map((p: any) => ({
          id: p.id,
          num: p.num,
          nome: p.nome,
          prontuario: p.prontuario,
          sexo: p.sexo,
          idadePrimeiraConsulta: p.idade_primeira_consulta,
          municipio: p.municipio,
          estadoCivil: p.estado_civil,
          numFilhos: p.num_filhos,
          ocupacao: p.ocupacao,
          escolaridade: p.escolaridade,
          cuidadorPosOp: p.cuidador_pos_op,
          dataPrimeiraConsulta: p.data_primeira_consulta,
          dataEmissaoAIH: p.data_emissao_aih,
          tempoProtocolo: p.tempo_protocolo,
          dataCirurgia: p.data_cirurgia,
          idadeNaCirurgia: p.idade_na_cirurgia,
          tipoCirurgia: p.tipo_cirurgia,
          pesoInicial: p.peso_inicial,
          pesoUltimoPreOp: p.peso_ultimo_pre_op,
          variacaoPesoPreOp: p.variacao_peso_pre_op,
          altura: p.altura,
          imcInicial: p.imc_inicial,
          imcUltimoPreOp: p.imc_ultimo_pre_op,
          expectativaPeso: p.expectativa_peso,
          perdaEsperada: p.perda_esperada,
          tabagismo: p.tabagismo,
          etilismo: p.etilismo,
          atividadeFisicaPre: p.atividade_fisica_pre,
          comerEmocional: p.comer_emocional,
          autoavaliacaoPsicologica: p.autoavaliacao_psicologica,
          obesidadeDesde: p.obesidade_desde,
          tentativasEmagrecimento: p.tentativas_emagrecimento,
          cirurgiasPrevias: p.cirurgias_previas,
          has: p.has,
          dm2: p.dm2,
          dislipidemia: p.dislipidemia,
          esteatoseHepatica: p.esteatose_hepatica,
          colelitiasePre: p.colelitiase_pre,
          asma: p.asma,
          outrasComorbidades: p.outras_comorbidades,
          medicacoesEmUso: p.medicacoes_em_uso,
          hPyloriResultado: p.h_pylori_resultado,
          hPyloriSituacao: p.h_pylori_situacao,
          edaResultado: p.eda_resultado,
          fezColonoscopia: p.fez_colonoscopia,
          resultadoColonoscopia: p.resultado_colonoscopia,
          outrasAlteracoesGI: p.outras_alteracoes_gi,
          usgAbdome: p.usg_abdome,
          espirometriaResultado: p.espirometria_resultado,
          rxTorax: p.rx_torax,
          ecoFE: p.eco_fe,
          ecoPSAP: p.eco_psap,
          ecoOutrasAlteracoes: p.eco_outras_alteracoes,
          riscoPulmonar: p.risco_pulmonar,
          riscoCV: p.risco_cv,
          clexaneDose: p.clexane_dose,
          hbA1c: p.hba1c,
          glicemiaJejum: p.glicemia_jejum,
          tsh: p.tsh,
          t4Livre: p.t4_livre,
          b12: p.b12,
          vitaminaD: p.vitamina_d,
          colesterolTotal: p.colesterol_total,
          hdl: p.hdl,
          ldl: p.ldl,
          triglicerideos: p.triglicerideos,
          tgo: p.tgo,
          tgp: p.tgp,
          pesoPO9dias: p.peso_po_9dias,
          pesoPO40dias: p.peso_po_40dias,
          pesoPO4_5meses: p.peso_po_4_5meses,
          pesoPO5meses: p.peso_po_5meses,
          pesoPO7meses: p.peso_po_7meses,
          pesoPO11meses: p.peso_po_11meses,
          peso1AnoPO: p.peso_1ano_po,
          perdaAbsoluta1Ano: p.perda_absoluta_1ano,
          percentExcessoPesoPerdido: p.percent_excesso_peso_perdido,
          atividadeFisica1AnoPO: p.atividade_fisica_1ano_po,
          excessoPele: p.excesso_pele,
          complicacoesPO: p.complicacoes_po,
          adesaoSuplementacao: p.adesao_suplementacao,
          altaCB: p.alta_cb,
          observacoesClinicas: p.observacoes_clinicas,
          ultimoIMC: p.ultimo_imc,
          edaPosData: p.eda_pos_data || '',
          edaPosUrease: p.eda_pos_urease || '',
          edaPosHPylori: p.eda_pos_hpylori || '',
          edaPosAchados: p.eda_pos_achados || '',
          usgPosData: p.usg_pos_data || '',
          usgPosVesicula: p.usg_pos_vesicula || '',
          usgPosObservacoes: p.usg_pos_observacoes || '',
          lastEditedAt: p.last_edited_at || ''
        }));
        
        setPatients(mappedData);
      } catch (e) {
        console.error('Erro ao carregar pacientes:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadPatients();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: { data: string, mimeType: string, name: string }[] = [];
    let filesProcessed = 0;

    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      if (file.type === 'application/pdf') {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          newFiles.push({ data: base64, mimeType: file.type, name: file.name });
          filesProcessed++;
          if (filesProcessed === acceptedFiles.length) {
            setCurrentFiles(prev => [...prev, ...newFiles]);
            setCurrentRecord('');
          }
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = () => {
          // For text files, we treat them as individual records or add to the list
          // To keep it simple, we'll convert text files to a "file" object too for batch consistency
          const base64 = btoa(unescape(encodeURIComponent(reader.result as string)));
          newFiles.push({ data: base64, mimeType: 'text/plain', name: file.name });
          filesProcessed++;
          if (filesProcessed === acceptedFiles.length) {
            setCurrentFiles(prev => [...prev, ...newFiles]);
            setCurrentRecord('');
          }
        };
        reader.readAsText(file);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'] },
    multiple: true 
  });

  const handleProcess = async () => {
    const hasText = currentRecord.trim().length > 0;
    const hasFiles = currentFiles.length > 0;
    
    if (!hasText && !hasFiles) return;
    
    setIsProcessing(true);
    setProgress(0);
    setRetryStatus('');
    
    // Interceptador de console logs para capturar status de retry
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('Modelo Gemini indisponível') || message.includes('Retrying')) {
        setRetryStatus(message);
      }
      originalConsoleWarn(...args);
    };
    
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      const itemsToProcess: { text?: string, file?: { data: string, mimeType: string } }[] = [];
      
      if (hasText) {
        itemsToProcess.push({ text: currentRecord });
      }
      
      currentFiles.forEach(f => {
        itemsToProcess.push({ file: { data: f.data, mimeType: f.mimeType } });
      });

      const total = itemsToProcess.length;
      const newPatientsList: PatientData[] = [];

      for (let i = 0; i < total; i++) {
        // Add a small delay between requests to avoid hitting rate limits
        if (i > 0) await sleep(1000);
        
        const extracted = await extractPatientData(itemsToProcess[i]);
        const newPatient: PatientData = {
          id: crypto.randomUUID(),
          num: (patients.length + newPatientsList.length + 1).toString(),
          nome: extracted.nome?.trim() || `Paciente ${patients.length + newPatientsList.length + 1}`,
          prontuario: extracted.prontuario?.trim() || '',
          sexo: extracted.sexo?.trim() || '',
          idadePrimeiraConsulta: extracted.idadePrimeiraConsulta?.trim() || '',
          municipio: extracted.municipio?.trim() || '',
          estadoCivil: extracted.estadoCivil?.trim() || '',
          numFilhos: extracted.numFilhos?.trim() || '',
          ocupacao: extracted.ocupacao?.trim() || '',
          escolaridade: extracted.escolaridade?.trim() || '',
          cuidadorPosOp: extracted.cuidadorPosOp?.trim() || '',
          dataPrimeiraConsulta: extracted.dataPrimeiraConsulta?.trim() || '',
          dataEmissaoAIH: extracted.dataEmissaoAIH?.trim() || '',
          tempoProtocolo: extracted.tempoProtocolo?.trim() || '',
          dataCirurgia: extracted.dataCirurgia?.trim() || '',
          idadeNaCirurgia: extracted.idadeNaCirurgia?.trim() || '',
          tipoCirurgia: extracted.tipoCirurgia?.trim() || '',
          pesoInicial: extracted.pesoInicial?.trim() || '',
          pesoUltimoPreOp: extracted.pesoUltimoPreOp?.trim() || '',
          variacaoPesoPreOp: extracted.variacaoPesoPreOp?.trim() || '',
          altura: extracted.altura?.trim() || '',
          imcInicial: extracted.imcInicial?.trim() || '',
          imcUltimoPreOp: extracted.imcUltimoPreOp?.trim() || '',
          expectativaPeso: extracted.expectativaPeso?.trim() || '',
          perdaEsperada: extracted.perdaEsperada?.trim() || '',
          tabagismo: extracted.tabagismo?.trim() || '',
          etilismo: extracted.etilismo?.trim() || '',
          atividadeFisicaPre: extracted.atividadeFisicaPre?.trim() || '',
          comerEmocional: extracted.comerEmocional?.trim() || '',
          autoavaliacaoPsicologica: extracted.autoavaliacaoPsicologica?.trim() || '',
          obesidadeDesde: extracted.obesidadeDesde?.trim() || '',
          tentativasEmagrecimento: extracted.tentativasEmagrecimento?.trim() || '',
          cirurgiasPrevias: extracted.cirurgiasPrevias?.trim() || '',
          has: extracted.has?.trim() || '',
          dm2: extracted.dm2?.trim() || '',
          dislipidemia: extracted.dislipidemia?.trim() || '',
          esteatoseHepatica: extracted.esteatoseHepatica?.trim() || '',
          colelitiasePre: extracted.colelitiasePre?.trim() || '',
          asma: extracted.asma?.trim() || '',
          outrasComorbidades: extracted.outrasComorbidades?.trim() || '',
          medicacoesEmUso: extracted.medicacoesEmUso?.trim() || '',
          hPyloriResultado: extracted.hPyloriResultado?.trim() || '',
          hPyloriSituacao: extracted.hPyloriSituacao?.trim() || '',
          edaResultado: extracted.edaResultado?.trim() || '',
          fezColonoscopia: extracted.fezColonoscopia?.trim() || '',
          resultadoColonoscopia: extracted.resultadoColonoscopia?.trim() || '',
          outrasAlteracoesGI: extracted.outrasAlteracoesGI?.trim() || '',
          usgAbdome: extracted.usgAbdome?.trim() || '',
          espirometriaResultado: extracted.espirometriaResultado?.trim() || '',
          rxTorax: extracted.rxTorax?.trim() || '',
          ecoFE: extracted.ecoFE?.trim() || '',
          ecoPSAP: extracted.ecoPSAP?.trim() || '',
          ecoOutrasAlteracoes: extracted.ecoOutrasAlteracoes?.trim() || '',
          riscoPulmonar: extracted.riscoPulmonar?.trim() || '',
          riscoCV: extracted.riscoCV?.trim() || '',
          clexaneDose: extracted.clexaneDose?.trim() || '',
          hbA1c: extracted.hbA1c?.trim() || '',
          glicemiaJejum: extracted.glicemiaJejum?.trim() || '',
          tsh: extracted.tsh?.trim() || '',
          t4Livre: extracted.t4Livre?.trim() || '',
          b12: extracted.b12?.trim() || '',
          vitaminaD: extracted.vitaminaD?.trim() || '',
          colesterolTotal: extracted.colesterolTotal?.trim() || '',
          hdl: extracted.hdl?.trim() || '',
          ldl: extracted.ldl?.trim() || '',
          triglicerideos: extracted.triglicerideos?.trim() || '',
          tgo: extracted.tgo?.trim() || '',
          tgp: extracted.tgp?.trim() || '',
          pesoPO9dias: extracted.pesoPO9dias?.trim() || '',
          pesoPO40dias: extracted.pesoPO40dias?.trim() || '',
          pesoPO4_5meses: extracted.pesoPO4_5meses?.trim() || '',
          pesoPO5meses: extracted.pesoPO5meses?.trim() || '',
          pesoPO7meses: extracted.pesoPO7meses?.trim() || '',
          pesoPO11meses: extracted.pesoPO11meses?.trim() || '',
          peso1AnoPO: extracted.peso1AnoPO?.trim() || '',
          perdaAbsoluta1Ano: extracted.perdaAbsoluta1Ano?.trim() || '',
          percentExcessoPesoPerdido: extracted.percentExcessoPesoPerdido?.trim() || '',
          atividadeFisica1AnoPO: extracted.atividadeFisica1AnoPO?.trim() || '',
          excessoPele: extracted.excessoPele?.trim() || '',
          complicacoesPO: extracted.complicacoesPO?.trim() || '',
          adesaoSuplementacao: extracted.adesaoSuplementacao?.trim() || '',
          altaCB: extracted.altaCB?.trim() || '',
          observacoesClinicas: extracted.observacoesClinicas?.trim() || '',
          ultimoIMC: extracted.ultimoIMC?.trim() || '',
          edaPosData: extracted.edaPosData?.trim() || '',
          edaPosUrease: extracted.edaPosUrease?.trim() || '',
          edaPosHPylori: extracted.edaPosHPylori?.trim() || '',
          edaPosAchados: extracted.edaPosAchados?.trim() || '',
          usgPosData: extracted.usgPosData?.trim() || '',
          usgPosVesicula: extracted.usgPosVesicula?.trim() || '',
          usgPosObservacoes: extracted.usgPosObservacoes?.trim() || '',
          lastEditedAt: new Date().toISOString()
        };

        // Normalizar datas para formato DD/MM/YYYY antes de salvar
        const pacienteNormalizado = normalizarDatasPaciente(newPatient);
        newPatientsList.push(pacienteNormalizado);

        // Save to Supabase if configured
        if (isSupabaseConfigured()) {
          const { error } = await supabase
            .from('patients')
            .insert([{
              num: pacienteNormalizado.num,
              nome: pacienteNormalizado.nome,
              prontuario: pacienteNormalizado.prontuario,
              sexo: pacienteNormalizado.sexo,
              idade_primeira_consulta: pacienteNormalizado.idadePrimeiraConsulta,
              municipio: pacienteNormalizado.municipio,
              estado_civil: pacienteNormalizado.estadoCivil,
              num_filhos: pacienteNormalizado.numFilhos,
              ocupacao: pacienteNormalizado.ocupacao,
              escolaridade: pacienteNormalizado.escolaridade,
              cuidador_pos_op: pacienteNormalizado.cuidadorPosOp,
              data_primeira_consulta: pacienteNormalizado.dataPrimeiraConsulta,
              data_emissao_aih: pacienteNormalizado.dataEmissaoAIH,
              tempo_protocolo: pacienteNormalizado.tempoProtocolo,
              data_cirurgia: pacienteNormalizado.dataCirurgia,
              idade_na_cirurgia: pacienteNormalizado.idadeNaCirurgia,
              tipo_cirurgia: pacienteNormalizado.tipoCirurgia,
              peso_inicial: pacienteNormalizado.pesoInicial,
              peso_ultimo_pre_op: pacienteNormalizado.pesoUltimoPreOp,
              variacao_peso_pre_op: pacienteNormalizado.variacaoPesoPreOp,
              altura: pacienteNormalizado.altura,
              imc_inicial: pacienteNormalizado.imcInicial,
              imc_ultimo_pre_op: pacienteNormalizado.imcUltimoPreOp,
              expectativa_peso: pacienteNormalizado.expectativaPeso,
              perda_esperada: pacienteNormalizado.perdaEsperada,
              tabagismo: pacienteNormalizado.tabagismo,
              etilismo: pacienteNormalizado.etilismo,
              atividade_fisica_pre: pacienteNormalizado.atividadeFisicaPre,
              comer_emocional: pacienteNormalizado.comerEmocional,
              autoavaliacao_psicologica: pacienteNormalizado.autoavaliacaoPsicologica,
              obesidade_desde: pacienteNormalizado.obesidadeDesde,
              tentativas_emagrecimento: pacienteNormalizado.tentativasEmagrecimento,
              cirurgias_previas: pacienteNormalizado.cirurgiasPrevias,
              has: pacienteNormalizado.has,
              dm2: pacienteNormalizado.dm2,
              dislipidemia: pacienteNormalizado.dislipidemia,
              esteatose_hepatica: pacienteNormalizado.esteatoseHepatica,
              colelitiase_pre: pacienteNormalizado.colelitiasePre,
              asma: pacienteNormalizado.asma,
              outras_comorbidades: pacienteNormalizado.outrasComorbidades,
              medicacoes_em_uso: pacienteNormalizado.medicacoesEmUso,
              h_pylori_resultado: pacienteNormalizado.hPyloriResultado,
              h_pylori_situacao: pacienteNormalizado.hPyloriSituacao,
              eda_resultado: pacienteNormalizado.edaResultado,
              fez_colonoscopia: pacienteNormalizado.fezColonoscopia,
              resultado_colonoscopia: pacienteNormalizado.resultadoColonoscopia,
              outras_alteracoes_gi: pacienteNormalizado.outrasAlteracoesGI,
              usg_abdome: pacienteNormalizado.usgAbdome,
              espirometria_resultado: pacienteNormalizado.espirometriaResultado,
              rx_torax: pacienteNormalizado.rxTorax,
              eco_fe: pacienteNormalizado.ecoFE,
              eco_psap: pacienteNormalizado.ecoPSAP,
              eco_outras_alteracoes: pacienteNormalizado.ecoOutrasAlteracoes,
              risco_pulmonar: pacienteNormalizado.riscoPulmonar,
              risco_cv: pacienteNormalizado.riscoCV,
              clexane_dose: pacienteNormalizado.clexaneDose,
              hba1c: pacienteNormalizado.hbA1c,
              glicemia_jejum: pacienteNormalizado.glicemiaJejum,
              tsh: pacienteNormalizado.tsh,
              t4_livre: pacienteNormalizado.t4Livre,
              b12: pacienteNormalizado.b12,
              vitamina_d: pacienteNormalizado.vitaminaD,
              colesterol_total: pacienteNormalizado.colesterolTotal,
              hdl: pacienteNormalizado.hdl,
              ldl: pacienteNormalizado.ldl,
              triglicerideos: pacienteNormalizado.triglicerideos,
              tgo: pacienteNormalizado.tgo,
              tgp: pacienteNormalizado.tgp,
              peso_po_9dias: pacienteNormalizado.pesoPO9dias,
              peso_po_40dias: pacienteNormalizado.pesoPO40dias,
              peso_po_4_5meses: pacienteNormalizado.pesoPO4_5meses,
              peso_po_5meses: pacienteNormalizado.pesoPO5meses,
              peso_po_7meses: pacienteNormalizado.pesoPO7meses,
              peso_po_11meses: pacienteNormalizado.pesoPO11meses,
              peso_1ano_po: pacienteNormalizado.peso1AnoPO,
              perda_absoluta_1ano: pacienteNormalizado.perdaAbsoluta1Ano,
              percent_excesso_peso_perdido: pacienteNormalizado.percentExcessoPesoPerdido,
              atividade_fisica_1ano_po: pacienteNormalizado.atividadeFisica1AnoPO,
              excesso_pele: pacienteNormalizado.excessoPele,
              complicacoes_po: pacienteNormalizado.complicacoesPO,
              adesao_suplementacao: pacienteNormalizado.adesaoSuplementacao,
              alta_cb: pacienteNormalizado.altaCB,
              observacoes_clinicas: pacienteNormalizado.observacoesClinicas,
              ultimo_imc: pacienteNormalizado.ultimoIMC,
              eda_pos_data: pacienteNormalizado.edaPosData,
              eda_pos_urease: pacienteNormalizado.edaPosUrease,
              eda_pos_h_pylori: pacienteNormalizado.edaPosHPylori,
              eda_pos_achados: pacienteNormalizado.edaPosAchados,
              usg_pos_data: pacienteNormalizado.usgPosData,
              usg_pos_vesicula: pacienteNormalizado.usgPosVesicula,
              usg_pos_observacoes: pacienteNormalizado.usgPosObservacoes,
              last_edited_at: pacienteNormalizado.lastEditedAt
            }]);
          
          if (error) console.error('Erro ao salvar no Supabase:', error);
        }
        setProgress(Math.round(((i + 1) / total) * 100));
      }

      setPatients(prev => [...prev, ...newPatientsList]);
      if (newPatientsList.length > 0 && newPatientsList[newPatientsList.length - 1]?.id && !isAnimating) {
        setSelectedPatientId(newPatientsList[newPatientsList.length - 1].id);
      }
      setCurrentRecord('');
      setCurrentFiles([]);
    } catch (error: any) {
      console.error('Erro no processamento:', error);
      
      // Mensagens de erro específicas
      if (error.message?.includes("Chave da API Gemini não configurada")) {
        alert('Erro: Chave da API Gemini não configurada. Verifique o arquivo .env e adicione sua chave VITE_GEMINI_KEY.');
      } else if (error.message?.includes("Chave da API Gemini inválida")) {
        alert('Erro: Chave da API Gemini inválida ou expirada. Verifique sua chave e tente novamente.');
      } else if (error.message?.includes("Erro de conexão")) {
        alert('Erro: Falha na conexão com a API. Verifique sua conexão com a internet e tente novamente.');
      } else if (error.message?.includes("Nenhum modelo Gemini disponível") || error.message?.includes("is not found")) {
        alert('Erro: Nenhum modelo Gemini disponível foi encontrado. Isso pode ser um problema temporário da API. Tente novamente em alguns minutos.');
      } else if (error.message?.includes("modelo Gemini está temporariamente indisponível") || error.message?.includes("alta demanda")) {
        alert('O modelo Gemini está temporariamente indisponível devido à alta demanda. O sistema tentará novamente automaticamente. Por favor, aguarde alguns instantes.');
      } else if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
        alert('Limite de uso do Gemini atingido. Por favor, aguarde um momento e tente novamente com menos arquivos.');
      } else if (error.message?.includes("Erro ao processar prontuário")) {
        alert(`Erro ao processar prontuário: ${error.message}`);
      } else {
        alert('Erro ao processar prontuários. Verifique sua conexão ou chave de API.\n\nDetalhes: ' + (error.message || 'Erro desconhecido'));
      }
    } finally {
      // Restaurar console.warn original
      console.warn = originalConsoleWarn;
      setIsProcessing(false);
      setProgress(0);
      setRetryStatus('');
    }
  };

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Normalizar datas de todos os pacientes antes de exportar
    const pacientesNormalizados = patients.map(p => normalizarDatasPaciente(p));
    
    // Dados Gerais
    const generalData = pacientesNormalizados.map(p => [
      p.num, p.nome, p.prontuario, p.sexo, p.idadePrimeiraConsulta, p.municipio, p.estadoCivil, p.numFilhos, p.ocupacao, p.escolaridade, p.cuidadorPosOp, p.dataPrimeiraConsulta, p.dataEmissaoAIH, p.tempoProtocolo, p.dataCirurgia, p.idadeNaCirurgia, p.tipoCirurgia, p.pesoInicial, p.pesoUltimoPreOp, p.variacaoPesoPreOp, p.altura, p.imcInicial, p.imcUltimoPreOp, p.expectativaPeso, p.perdaEsperada, p.tabagismo, p.etilismo, p.atividadeFisicaPre, p.comerEmocional, p.autoavaliacaoPsicologica, p.obesidadeDesde, p.tentativasEmagrecimento, p.cirurgiasPrevias, p.observacoesClinicas, p.ultimoIMC
    ]);
    const wsGeneral = XLSX.utils.aoa_to_sheet([
      ["Nº", "Nome", "Prontuário", "Sexo", "Idade 1ª Consulta", "Município", "Estado Civil", "Nº Filhos", "Ocupação", "Escolaridade", "Cuidador Pós-op", "Data 1ª Consulta", "Data Emissão AIH", "Tempo Protocolo", "Data Cirurgia", "Idade na Cirurgia", "Tipo Cirurgia", "Peso Inicial", "Peso Último Pré-op", "Variação Peso", "Altura", "IMC Inicial", "IMC Último Pré-op", "Expectativa Peso", "Perda Esperada", "Tabagismo", "Etilismo", "Atividade Física Pré", "Comer Emocional", "Autoavaliação Psicológica", "Obesidade Desde", "Tentativas Emagrecimento", "Cirurgias Prévias", "Observações", "Último IMC"],
      ...generalData
    ]);
    XLSX.utils.book_append_sheet(wb, wsGeneral, "Dados Gerais");

    // Comorbidades
    const comorbData = pacientesNormalizados.map(p => [
      p.nome, p.has, p.dm2, p.dislipidemia, p.esteatoseHepatica, p.colelitiasePre, p.asma, p.outrasComorbidades, p.medicacoesEmUso
    ]);
    const wsComorb = XLSX.utils.aoa_to_sheet([
      ["Nome", "HAS", "DM2", "Dislipidemia", "Esteatose", "Colelitíase Pré", "Asma", "Outras", "Medicações"],
      ...comorbData
    ]);
    XLSX.utils.book_append_sheet(wb, wsComorb, "Comorbidades");

    // EDA e USG
    const edaUsgData = pacientesNormalizados.map(p => [
      p.nome, p.hPyloriResultado, p.hPyloriSituacao, p.edaResultado, p.fezColonoscopia, p.resultadoColonoscopia, p.usgAbdome, p.edaPosData, p.edaPosUrease, p.edaPosHPylori, p.edaPosAchados, p.usgPosData, p.usgPosVesicula, p.usgPosObservacoes
    ]);
    const wsEdaUsg = XLSX.utils.aoa_to_sheet([
      ["Nome", "H. Pylori Pré", "Situação H. Pylori", "EDA Pré", "Colonoscopia", "Resultado Colono", "USG Pré", "EDA Pós Data", "EDA Pós Urease", "EDA Pós H. Pylori", "EDA Pós Achados", "USG Pós Data", "USG Pós Vesícula", "USG Pós Obs"],
      ...edaUsgData
    ]);
    XLSX.utils.book_append_sheet(wb, wsEdaUsg, "EDA e USG");

    // Pós-operatório
    const poData = pacientesNormalizados.map(p => [
      p.nome, p.pesoPO9dias, p.pesoPO40dias, p.pesoPO4_5meses, p.pesoPO5meses, p.pesoPO7meses, p.pesoPO11meses, p.peso1AnoPO, p.perdaAbsoluta1Ano, p.percentExcessoPesoPerdido, p.atividadeFisica1AnoPO, p.excessoPele, p.complicacoesPO, p.adesaoSuplementacao, p.altaCB
    ]);
    const wsPO = XLSX.utils.aoa_to_sheet([
      ["Nome", "9 dias", "40 dias", "4,5 meses", "5 meses", "7 meses", "11 meses", "1 ano", "Perda Absoluta", "% Excesso Perdido", "Atividade Física", "Excesso Pele", "Complicações", "Adesão Supl.", "Alta"],
      ...poData
    ]);
    XLSX.utils.book_append_sheet(wb, wsPO, "Pós-operatório");

    XLSX.writeFile(wb, "pesquisa_bariatrica_completa.xlsx");
  };

  const removePatient = async (id: string) => {
    if (confirm('Deseja realmente excluir este paciente?')) {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('patients')
          .delete()
          .eq('id', id);
        if (error) {
          alert('Erro ao excluir do banco de dados.');
          return;
        }
      }
      setPatients(prev => prev.filter(p => p.id !== id));
      if (selectedPatientId === id) setSelectedPatientId(null);
    }
  };

  const handlePatientSelect = (patientId: string) => {
    if (!isAnimating && !isProcessing) {
      setIsAnimating(true);
      setSelectedPatientId(patientId);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleEdit = (patient: PatientData) => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // Reset após animação
    setEditData({ ...patient });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editData) return;
    if (!confirm('Deseja salvar as alterações realizadas neste paciente?')) return;

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const updatedPatient = { ...editData, lastEditedAt: now };

      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('patients')
          .update({
            num: updatedPatient.num,
            nome: updatedPatient.nome,
            prontuario: updatedPatient.prontuario,
            sexo: updatedPatient.sexo,
            idade_primeira_consulta: updatedPatient.idadePrimeiraConsulta,
            municipio: updatedPatient.municipio,
            estado_civil: updatedPatient.estadoCivil,
            num_filhos: updatedPatient.numFilhos,
            ocupacao: updatedPatient.ocupacao,
            escolaridade: updatedPatient.escolaridade,
            cuidador_pos_op: updatedPatient.cuidadorPosOp,
            data_primeira_consulta: updatedPatient.dataPrimeiraConsulta,
            data_emissao_aih: updatedPatient.dataEmissaoAIH,
            tempo_protocolo: updatedPatient.tempoProtocolo,
            data_cirurgia: updatedPatient.dataCirurgia,
            idade_na_cirurgia: updatedPatient.idadeNaCirurgia,
            tipo_cirurgia: updatedPatient.tipoCirurgia,
            peso_inicial: updatedPatient.pesoInicial,
            peso_ultimo_pre_op: updatedPatient.pesoUltimoPreOp,
            variacao_peso_pre_op: updatedPatient.variacaoPesoPreOp,
            altura: updatedPatient.altura,
            imc_inicial: updatedPatient.imcInicial,
            imc_ultimo_pre_op: updatedPatient.imcUltimoPreOp,
            expectativa_peso: updatedPatient.expectativaPeso,
            perda_esperada: updatedPatient.perdaEsperada,
            tabagismo: updatedPatient.tabagismo,
            etilismo: updatedPatient.etilismo,
            atividade_fisica_pre: updatedPatient.atividadeFisicaPre,
            comer_emocional: updatedPatient.comerEmocional,
            autoavaliacao_psicologica: updatedPatient.autoavaliacaoPsicologica,
            obesidade_desde: updatedPatient.obesidadeDesde,
            tentativas_emagrecimento: updatedPatient.tentativasEmagrecimento,
            cirurgias_previas: updatedPatient.cirurgiasPrevias,
            has: updatedPatient.has,
            dm2: updatedPatient.dm2,
            dislipidemia: updatedPatient.dislipidemia,
            esteatose_hepatica: updatedPatient.esteatoseHepatica,
            colelitiase_pre: updatedPatient.colelitiasePre,
            asma: updatedPatient.asma,
            outras_comorbidades: updatedPatient.outrasComorbidades,
            medicacoes_em_uso: updatedPatient.medicacoesEmUso,
            h_pylori_resultado: updatedPatient.hPyloriResultado,
            h_pylori_situacao: updatedPatient.hPyloriSituacao,
            eda_resultado: updatedPatient.edaResultado,
            fez_colonoscopia: updatedPatient.fezColonoscopia,
            resultado_colonoscopia: updatedPatient.resultadoColonoscopia,
            outras_alteracoes_gi: updatedPatient.outrasAlteracoesGI,
            usg_abdome: updatedPatient.usgAbdome,
            espirometria_resultado: updatedPatient.espirometriaResultado,
            rx_torax: updatedPatient.rxTorax,
            eco_fe: updatedPatient.ecoFE,
            eco_psap: updatedPatient.ecoPSAP,
            eco_outras_alteracoes: updatedPatient.ecoOutrasAlteracoes,
            risco_pulmonar: updatedPatient.riscoPulmonar,
            risco_cv: updatedPatient.riscoCV,
            clexane_dose: updatedPatient.clexaneDose,
            hba1c: updatedPatient.hbA1c,
            glicemia_jejum: updatedPatient.glicemiaJejum,
            tsh: updatedPatient.tsh,
            t4_livre: updatedPatient.t4Livre,
            b12: updatedPatient.b12,
            vitamina_d: updatedPatient.vitaminaD,
            colesterol_total: updatedPatient.colesterolTotal,
            hdl: updatedPatient.hdl,
            ldl: updatedPatient.ldl,
            triglicerideos: updatedPatient.triglicerideos,
            tgo: updatedPatient.tgo,
            tgp: updatedPatient.tgp,
            peso_po_9dias: updatedPatient.pesoPO9dias,
            peso_po_40dias: updatedPatient.pesoPO40dias,
            peso_po_4_5meses: updatedPatient.pesoPO4_5meses,
            peso_po_5meses: updatedPatient.pesoPO5meses,
            peso_po_7meses: updatedPatient.pesoPO7meses,
            peso_po_11meses: updatedPatient.pesoPO11meses,
            peso_1ano_po: updatedPatient.peso1AnoPO,
            perda_absoluta_1ano: updatedPatient.perdaAbsoluta1Ano,
            percent_excesso_peso_perdido: updatedPatient.percentExcessoPesoPerdido,
            atividade_fisica_1ano_po: updatedPatient.atividadeFisica1AnoPO,
            excesso_pele: updatedPatient.excessoPele,
            complicacoes_po: updatedPatient.complicacoesPO,
            adesao_suplementacao: updatedPatient.adesaoSuplementacao,
            alta_cb: updatedPatient.altaCB,
            observacoes_clinicas: updatedPatient.observacoesClinicas,
            ultimo_imc: updatedPatient.ultimoIMC,
            eda_pos_data: updatedPatient.edaPosData,
            eda_pos_urease: updatedPatient.edaPosUrease,
            eda_pos_hpylori: updatedPatient.edaPosHPylori,
            eda_pos_achados: updatedPatient.edaPosAchados,
            usg_pos_data: updatedPatient.usgPosData,
            usg_pos_vesicula: updatedPatient.usgPosVesicula,
            usg_pos_observacoes: updatedPatient.usgPosObservacoes,
            last_edited_at: now
          })
          .eq('id', updatedPatient.id);
        
        if (error) throw error;
      }

      setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
      setIsEditing(false);
      setEditData(null);
    } catch (e) {
      console.error('Erro ao salvar edição:', e);
      alert('Erro ao salvar alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExtraçãoComplementar = async (patientId: string, prontuarioText: string) => {
    if (!prontuarioText.trim()) {
      alert('Cole o texto do prontuário para extrair os laboratoriais');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setRetryStatus('');

    // Intercept console.warn para capturar status de retry
    const originalConsoleWarn = console.warn;
    console.warn = (message: any) => {
      if (typeof message === 'string' && message.includes('tentativa')) {
        setRetryStatus(message);
      }
      originalConsoleWarn(message);
    };

    try {
      // Verificar se já tem laboratoriais
      const { hasLabs } = await checkPacienteTemLaboratoriais(patientId);
      
      if (hasLabs) {
        const confirmOverwrite = window.confirm(
          'Este paciente já possui exames laboratoriais cadastrados. Deseja sobrescrever os dados existentes?'
        );
        if (!confirmOverwrite) {
          setIsProcessing(false);
          return;
        }
      }

      // Extrair laboratoriais
      const examesData = await extractExamesLaboratoriais({
        text: prontuarioText
      });

      // Salvar no banco
      const { error } = await saveExamesLaboratoriais(patientId, examesData);
      
      if (error) {
        console.error('Erro ao salvar laboratoriais:', error);
        alert('Erro ao salvar exames laboratoriais');
      } else {
        alert('Laboratoriais extraídos e salvos com sucesso!');
        setShowExtraçãoComplementar(false);
      }
    } catch (error: any) {
      console.error('Erro no processamento:', error);
      
      // Mensagens de erro específicas
      if (error.message?.includes("Chave da API Gemini não configurada")) {
        alert('Erro: Chave da API Gemini não configurada. Verifique o arquivo .env e adicione sua chave VITE_GEMINI_KEY.');
      } else if (error.message?.includes("Chave da API Gemini inválida")) {
        alert('Erro: Chave da API Gemini inválida ou expirada. Verifique sua chave e tente novamente.');
      } else if (error.message?.includes("Erro de conexão")) {
        alert('Erro: Falha na conexão com a API. Verifique sua conexão com a internet e tente novamente.');
      } else if (error.message?.includes("Nenhum modelo Gemini disponível") || error.message?.includes("is not found")) {
        alert('Erro: Nenhum modelo Gemini disponível foi encontrado. Isso pode ser um problema temporário da API. Tente novamente em alguns minutos.');
      } else if (error.message?.includes("modelo Gemini está temporariamente indisponível") || error.message?.includes("alta demanda")) {
        alert('O modelo Gemini está temporariamente indisponível devido à alta demanda. O sistema tentará novamente automaticamente. Por favor, aguarde alguns instantes.');
      } else if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
        alert('Limite de uso do Gemini atingido. Por favor, aguarde um momento e tente novamente com menos arquivos.');
      } else {
        alert(`Erro ao processar exames laboratoriais: ${error.message}`);
      }
    } finally {
      console.warn = originalConsoleWarn;
      setIsProcessing(false);
      setProgress(0);
      setRetryStatus('');
    }
  };

  const filteredPatients = patients.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.prontuario.includes(searchTerm)
  );

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

  const calculatePostOpTime = (cirurgia: string | null | undefined, exame: string | null | undefined) => {
    if (!cirurgia?.trim() || !exame?.trim()) return 'N/A';
    try {
      const dateCirurgia = parse(cirurgia.trim(), 'dd/MM/yyyy', new Date());
      const dateExame = parse(exame.trim(), 'dd/MM/yyyy', new Date());
      const months = differenceInMonths(dateExame, dateCirurgia);
      if (months < 12) return `${months} meses`;
      const years = differenceInYears(dateExame, dateCirurgia);
      const remainingMonths = months % 12;
      return remainingMonths > 0 ? `${years} anos e ${remainingMonths} meses` : `${years} anos`;
    } catch (e) {
      return 'Erro no cálculo';
    }
  };

  const renderEditForm = () => {
    if (!editData) return null;

    const handleChange = (field: keyof PatientData, value: string) => {
      setEditData(prev => prev ? { ...prev, [field]: value } : null);
    };

    return (
      <motion.div 
        key={`edit-${editData?.id || 'new'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg text-white">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Editar Paciente</h2>
                <p className="text-xs text-gray-500">Alterando dados de {editData.nome}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Identificação</h3>
              <EditField label="Nome" value={editData.nome} onChange={(v) => handleChange('nome', v)} />
              <EditField label="Prontuário" value={editData.prontuario} onChange={(v) => handleChange('prontuario', v)} />
              <EditField label="Sexo" value={editData.sexo} onChange={(v) => handleChange('sexo', v)} />
              <EditField label="Data 1ª Consulta" value={editData.dataPrimeiraConsulta} onChange={(v) => handleChange('dataPrimeiraConsulta', v)} />
              <EditField label="Município" value={editData.municipio} onChange={(v) => handleChange('municipio', v)} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Antropometria</h3>
              <EditField label="Peso Inicial" value={editData.pesoInicial} onChange={(v) => handleChange('pesoInicial', v)} />
              <EditField label="Altura" value={editData.altura} onChange={(v) => handleChange('altura', v)} />
              <EditField label="IMC Inicial" value={editData.imcInicial} onChange={(v) => handleChange('imcInicial', v)} />
              <EditField label="Data Cirurgia" value={editData.dataCirurgia} onChange={(v) => handleChange('dataCirurgia', v)} />
              <EditField label="Tipo Cirurgia" value={editData.tipoCirurgia} onChange={(v) => handleChange('tipoCirurgia', v)} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">EDA Pós-operatória</h3>
              <EditField label="Data EDA Pós" value={editData.edaPosData} onChange={(v) => handleChange('edaPosData', v)} />
              <EditField label="Urease" value={editData.edaPosUrease} onChange={(v) => handleChange('edaPosUrease', v)} />
              <EditField label="H. Pylori" value={editData.edaPosHPylori} onChange={(v) => handleChange('edaPosHPylori', v)} />
              <EditField label="Achados" value={editData.edaPosAchados} onChange={(v) => handleChange('edaPosAchados', v)} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">USG Pós-operatório</h3>
              <EditField label="Data USG Pós" value={editData.usgPosData} onChange={(v) => handleChange('usgPosData', v)} />
              <EditField label="Vesícula" value={editData.usgPosVesicula} onChange={(v) => handleChange('usgPosVesicula', v)} />
              <EditField label="Observações" value={editData.usgPosObservacoes} onChange={(v) => handleChange('usgPosObservacoes', v)} />
            </div>

            <div className="space-y-4 lg:col-span-2">
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Observações Gerais</h3>
              <textarea 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[100px]"
                value={editData.observacoesClinicas}
                onChange={(e) => handleChange('observacoesClinicas', e.target.value)}
              />
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 text-gray-600 font-bold text-xs hover:bg-gray-100 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="px-8 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Salvar Alterações
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderDashboard = () => {
    const totalPatients = patients.length;
    const bypassCount = patients.filter(p => p.tipoCirurgia?.toLowerCase().includes('bypass')).length;
    const sleeveCount = patients.filter(p => p.tipoCirurgia?.toLowerCase().includes('sleeve')).length;
    const otherSurgCount = totalPatients - bypassCount - sleeveCount;

    const maleCount = patients.filter(p => p.sexo?.toLowerCase() === 'masculino').length;
    const femaleCount = patients.filter(p => p.sexo?.toLowerCase() === 'feminino').length;

    const hPyloriPreCount = patients.filter(p => p.hPyloriResultado?.toLowerCase().includes('pos')).length;
    const hPyloriPosCount = patients.filter(p => p.edaPosHPylori?.toLowerCase().includes('pos')).length;

    const colelitiasePosCount = patients.filter(p => p.usgPosVesicula?.toLowerCase().includes('coleli')).length;

    const surgeryTypeData = {
      labels: ['Bypass', 'Sleeve', 'Outros'],
      datasets: [{
        data: [bypassCount, sleeveCount, otherSurgCount],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
      }]
    };

    const sexData = {
      labels: ['Masculino', 'Feminino'],
      datasets: [{
        data: [maleCount, femaleCount],
        backgroundColor: ['#60A5FA', '#F472B6'],
      }]
    };

    const hPyloriData = {
      labels: ['Pré-operatório', 'Pós-operatório'],
      datasets: [{
        label: 'H. Pylori Positivo (%)',
        data: [
          totalPatients ? (hPyloriPreCount / totalPatients) * 100 : 0,
          totalPatients ? (hPyloriPosCount / totalPatients) * 100 : 0
        ],
        backgroundColor: '#EF4444',
      }]
    };

    return (
      <div className="space-y-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total de Pacientes" value={totalPatients} icon={<Users className="w-5 h-5" />} color="bg-blue-500" />
          <StatCard title="Bypass Gástrico" value={bypassCount} icon={<Activity className="w-5 h-5" />} color="bg-emerald-500" />
          <StatCard title="Sleeve Gástrico" value={sleeveCount} icon={<Activity className="w-5 h-5" />} color="bg-blue-400" />
          <StatCard title="Colelitíase Pós" value={colelitiasePosCount} icon={<AlertCircle className="w-5 h-5" />} color="bg-amber-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartContainer title="Distribuição por Tipo de Cirurgia">
            <div className="h-64 flex justify-center">
              <Pie data={surgeryTypeData} options={{ maintainAspectRatio: false }} />
            </div>
          </ChartContainer>
          <ChartContainer title="Distribuição por Sexo">
            <div className="h-64 flex justify-center">
              <Pie data={sexData} options={{ maintainAspectRatio: false }} />
            </div>
          </ChartContainer>
          <ChartContainer title="Prevalência de H. Pylori (Pré x Pós)">
            <div className="h-64">
              <Bar data={hPyloriData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }} />
            </div>
          </ChartContainer>
          <ChartContainer title="Incidência de Colelitíase Pós-op">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="text-5xl font-bold text-amber-600">
                {totalPatients ? ((colelitiasePosCount / totalPatients) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-gray-500 text-center max-w-xs">
                Dos pacientes acompanhados desenvolveram cálculos na vesícula após a cirurgia.
              </p>
            </div>
          </ChartContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-bottom border-gray-100">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">BariExtract</h1>
          </div>

          <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
            <button 
              onClick={() => setActiveTab('patients')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'patients' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4" />
              Pacientes
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'dashboard' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
          </div>
          
          {activeTab === 'patients' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar paciente..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'patients' ? (
            filteredPatients.length === 0 ? (
              <div className="text-center py-10">
                <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Nenhum paciente coletado</p>
              </div>
            ) : (
              filteredPatients.map(patient => (
                <motion.div
                  layout
                  key={patient.id}
                  onClick={() => !isProcessing && handlePatientSelect(patient.id)}
                  className={`p-4 rounded-xl transition-all border ${
                    selectedPatientId === patient.id 
                      ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                      : isProcessing
                        ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
                        : 'bg-white border-transparent hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-sm truncate w-48">{patient.nome}</h3>
                      <p className="text-xs text-gray-500 mt-1">Prontuário: {patient.prontuario}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); !isProcessing && removePatient(patient.id); }}
                      disabled={isProcessing}
                      className={`p-1 transition-colors ${
                        isProcessing 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )
          ) : (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Resumo da Coorte</h4>
              <p className="text-[10px] text-blue-700 leading-relaxed">
                Visualize estatísticas agregadas de todos os pacientes cadastrados no sistema.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={downloadExcel}
            disabled={patients.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {isEditing && renderEditForm()}
        </AnimatePresence>
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">BariExtract</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="text-sm font-bold text-gray-900">
              {activeTab === 'dashboard' ? 'Dashboard Estatístico' : 'Gerenciamento de Pacientes'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {!isSupabaseConfigured() && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">DB Local (Offline)</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">IA Ativa</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'dashboard' ? renderDashboard() : (
              <div className="space-y-8">
                {/* Input Section */}
                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">Novo Prontuário</h2>
                        <p className="text-xs text-gray-500">Cole o texto ou arraste o arquivo do paciente</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setExtractionMode('completa')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                          extractionMode === 'completa' 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Nova Extração Completa</span>
                      </button>
                      <button
                        onClick={() => setShowExtraçãoComplementar(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">Extração Complementar (Laboratoriais)</span>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setCurrentRecord(`Paciente: João Silva, 45 anos.
Prontuário: 123456. Sexo: Masculino.
Cidade: Cuiabá-MT.
Peso Inicial: 130kg. Altura: 1,75m.
Comorbidades: HAS e DM2.
Cirurgia realizada em 10/01/2024: Bypass Gástrico.
Peso 40 dias PO: 115kg.
Apto para cirurgia após liberação da cardiologia e nutrição.`);
                          setCurrentFiles([]);
                        }}
                        className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded-lg transition-colors"
                      >
                        Usar Exemplo
                      </button>
                      <button 
                        onClick={handleProcess}
                        disabled={isProcessing || (!currentRecord.trim() && currentFiles.length === 0)}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-all relative overflow-hidden"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processando ({progress}%)</span>
                            {retryStatus && (
                              <span className="text-xs text-amber-600 ml-2">
                                {retryStatus.includes('Retrying') ? '⏳' : '⚠️'} {retryStatus}
                              </span>
                            )}
                            <motion.div 
                              className="absolute bottom-0 left-0 h-1 bg-emerald-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                            />
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Extrair {currentFiles.length > 0 ? `${currentFiles.length} Prontuários` : 'Dados'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span className="text-[10px] font-bold text-amber-800 uppercase">Lote</span>
                        </div>
                        <p className="text-[10px] text-amber-700">Você pode enviar múltiplos arquivos de uma vez para análise em lote.</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          <span className="text-[10px] font-bold text-blue-800 uppercase">Progresso</span>
                        </div>
                        <p className="text-[10px] text-blue-700">Acompanhe a barra de percentual para saber o status da extração.</p>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Download className="w-3 h-3 text-emerald-600" />
                          <span className="text-[10px] font-bold text-emerald-800 uppercase">Exportação</span>
                        </div>
                        <p className="text-[10px] text-emerald-700">Todos os dados processados serão incluídos no Excel final.</p>
                      </div>
                    </div>
                    <div 
                      {...getRootProps()} 
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                        isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-400'
                      } ${currentFiles.length > 0 ? 'border-emerald-500 bg-emerald-50/30' : ''}`}
                    >
                      <input {...getInputProps()} />
                      {currentFiles.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {currentFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-white border border-emerald-100 rounded-lg shadow-sm">
                              <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <p className="text-[10px] font-medium text-gray-700 truncate">{file.name}</p>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setCurrentFiles(prev => prev.filter((_, i) => i !== idx)); 
                                }}
                                className="ml-auto text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <div className="flex items-center justify-center p-2 border border-dashed border-emerald-200 rounded-lg text-emerald-600">
                            <Plus className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-600">
                            Arraste múltiplos arquivos .txt ou .pdf, ou clique para selecionar
                          </p>
                        </>
                      )}
                    </div>

                    {currentFiles.length === 0 && (
                      <textarea
                        className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                        placeholder="Ou cole o conteúdo do prontuário aqui..."
                        value={currentRecord}
                        onChange={(e) => {
                          setCurrentRecord(e.target.value);
                          if (e.target.value.trim()) setCurrentFiles([]);
                        }}
                      />
                    )}
                  </div>
                </section>

                {/* Results Section */}
                <AnimatePresence mode="wait">
                  {selectedPatient && selectedPatient.id ? (
                    <motion.section
                      key={`patient-${selectedPatient.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <h2 className="font-bold text-gray-900">{selectedPatient.nome}</h2>
                            <p className="text-xs text-gray-500">Dados extraídos com sucesso</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(selectedPatient)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
                          >
                            <Edit3 className="w-3 h-3" />
                            Editar Dados
                          </button>
                        </div>
                      </div>

                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Identification */}
                        <DataGroup title="Identificação">
                          <DataItem label="Sexo" value={selectedPatient?.sexo} />
                          <DataItem label="Idade 1ª Consulta" value={selectedPatient?.idadePrimeiraConsulta} />
                          <DataItem label="Município" value={selectedPatient?.municipio} />
                          <DataItem label="Estado Civil" value={selectedPatient?.estadoCivil} />
                          <DataItem label="Nº Filhos" value={selectedPatient?.numFilhos} />
                          <DataItem label="Escolaridade" value={selectedPatient?.escolaridade} />
                        </DataGroup>

                        {/* Pre-op */}
                        <DataGroup title="Antropometria Pré-op">
                          <DataItem label="Peso Inicial" value={selectedPatient?.pesoInicial} />
                          <DataItem label="Peso Último" value={selectedPatient?.pesoUltimoPreOp} />
                          <DataItem label="Variação Peso" value={selectedPatient?.variacaoPesoPreOp} />
                          <DataItem label="Altura" value={selectedPatient?.altura} />
                          <DataItem label="IMC Inicial" value={selectedPatient?.imcInicial} />
                          <DataItem label="Último IMC" value={selectedPatient?.ultimoIMC} />
                          <DataItem label="% Perda Peso" value={selectedPatient?.percentExcessoPesoPerdido} />
                          <DataItem label="Tipo Cirurgia" value={selectedPatient?.tipoCirurgia} />
                        </DataGroup>

                        {/* Comorbidities */}
                        <DataGroup title="Comorbidades">
                          <DataItem label="HAS" value={selectedPatient?.has} />
                          <DataItem label="DM2" value={selectedPatient?.dm2} />
                          <DataItem label="Dislipidemia" value={selectedPatient?.dislipidemia} />
                          <DataItem label="Esteatose" value={selectedPatient?.esteatoseHepatica} />
                          <DataItem label="Colelitíase Pré" value={selectedPatient?.colelitiasePre} />
                        </DataGroup>

                        {/* Labs & Exams */}
                        <DataGroup title="Exames Pré-operatórios">
                          <DataItem label="H. Pylori" value={selectedPatient?.hPyloriResultado} />
                          <DataItem label="EDA" value={selectedPatient?.edaResultado} />
                          <DataItem label="Colonoscopia?" value={selectedPatient?.fezColonoscopia} />
                          <DataItem label="Resultado Colono" value={selectedPatient?.resultadoColonoscopia} />
                          <DataItem label="USG Abdome" value={selectedPatient?.usgAbdome} />
                        </DataGroup>

                        {/* EDA Pós */}
                        <DataGroup title="EDA Pós-operatória">
                          <DataItem label="Data" value={selectedPatient?.edaPosData} />
                          <DataItem label="Tempo Pós" value={calculatePostOpTime(selectedPatient?.dataCirurgia || '', selectedPatient?.edaPosData || '')} />
                          <DataItem label="Urease" value={selectedPatient?.edaPosUrease} />
                          <DataItem label="H. Pylori" value={selectedPatient?.edaPosHPylori} />
                          <DataItem label="Achados" value={selectedPatient?.edaPosAchados} />
                          <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Comparativo EDA</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-[9px] text-gray-400">Pré</p>
                                <p className="text-[10px] font-medium truncate">{selectedPatient?.edaResultado || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-gray-400">Pós</p>
                                <p className="text-[10px] font-medium truncate">{selectedPatient?.edaPosAchados || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        </DataGroup>

                        {/* USG Pós */}
                        <DataGroup title="USG Pós-operatório">
                          <DataItem label="Data" value={selectedPatient?.usgPosData} />
                          <DataItem label="Tempo Pós" value={calculatePostOpTime(selectedPatient?.dataCirurgia || '', selectedPatient?.usgPosData || '')} />
                          <DataItem label="Vesícula" value={selectedPatient?.usgPosVesicula} />
                          {selectedPatient?.usgPosVesicula?.toLowerCase().includes('coleli') && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded text-[9px] font-bold uppercase">
                              <AlertCircle className="w-2 h-2" />
                              Desenvolveu Colelitíase
                            </div>
                          )}
                          <DataItem label="Observações" value={selectedPatient?.usgPosObservacoes} />
                        </DataGroup>

                        {/* Post-op Follow-up */}
                        <DataGroup title="Acompanhamento Pós">
                          <DataItem label="Peso 1 Ano" value={selectedPatient?.peso1AnoPO} />
                          <DataItem label="Complicações" value={selectedPatient?.complicacoesPO} />
                          <DataItem label="Adesão Supl." value={selectedPatient?.adesaoSuplementacao} />
                        </DataGroup>
                      </div>

                      <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Observações Clínicas</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {selectedPatient?.observacoesClinicas || 'Nenhuma observação relevante extraída.'}
                          </p>
                        </div>
                        {selectedPatient?.lastEditedAt && (
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Última Edição</p>
                            <p className="text-[10px] text-gray-500">{format(new Date(selectedPatient?.lastEditedAt || new Date()), 'dd/MM/yyyy HH:mm')}</p>
                          </div>
                        )}
                      </div>
                    </motion.section>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                      <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-400">Selecione ou adicione um paciente para ver os detalhes</h3>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de Extração Complementar */}
      <AnimatePresence>
        {showExtraçãoComplementar && (
          <ExtraçãoComplementar
            onClose={() => setShowExtraçãoComplementar(false)}
            onSuccess={() => {
              // Poderia recarregar dados ou mostrar mensagem de sucesso
              setShowExtraçãoComplementar(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DataGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-2">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function DataItem({ label, value }: { label: string, value: string | null | undefined }) {
  const safeValue = value?.trim() || '';
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className={`text-xs font-semibold truncate max-w-[150px] ${safeValue ? 'text-gray-900' : 'text-gray-300 italic'}`}>
        {safeValue || 'N/A'}
      </span>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number | string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`p-3 ${color} text-white rounded-xl`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ChartContainer({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BarChartIcon className="w-4 h-4 text-emerald-500" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function EditField({ label, value, onChange }: { label: string, value: string | null | undefined, onChange: (v: string) => void }) {
  const safeValue = value?.trim() || '';
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">{label}</label>
      <input 
        type="text" 
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
