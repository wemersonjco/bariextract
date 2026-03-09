import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ExamesLaboratoriais, PatientData } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Tipo para compatibilidade com banco de dados
type PacienteSimples = {
  id: string;
  num: string;
  nome: string;
  prontuario: string;
  data_cirurgia: string;
};

// Função para converter data DD/MM/YYYY para YYYY-MM-DD (formato do Supabase)
export const converterDataParaSupabase = (data: string | undefined | null): string | null => {
  if (!data || data.trim() === '') return null;
  
  // Remove espaços e verifica se está no formato DD/MM/YYYY
  let dataLimpa = data.trim();
  
  // Se for um intervalo de datas, pega apenas a primeira data
  if (dataLimpa.includes(' a ') || dataLimpa.includes(' até ') || dataLimpa.includes(' - ')) {
    const separadores = [' a ', ' até ', ' - ', ' ao '];
    for (const sep of separadores) {
      if (dataLimpa.includes(sep)) {
        dataLimpa = dataLimpa.split(sep)[0].trim();
        break;
      }
    }
    console.log('Intervalo de datas detectado, usando primeira data:', data, '→', dataLimpa);
  }
  
  const regexData = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  
  if (!regexData.test(dataLimpa)) {
    console.warn('Data inválida, mantendo original:', data);
    return dataLimpa; // Retorna original se não for DD/MM/YYYY
  }
  
  const [, dia, mes, ano] = dataLimpa.match(regexData) || [];
  return `${ano}-${mes}-${dia}`;
};

// Função para converter data YYYY-MM-DD para DD/MM/YYYY (formato brasileiro)
export const converterDataParaExibicao = (data: string | undefined | null): string => {
  if (!data || data.trim() === '') return '';
  
  // Remove espaços e verifica se está no formato YYYY-MM-DD
  let dataLimpa = data.trim();
  
  // Se for um intervalo de datas, pega apenas a primeira data
  if (dataLimpa.includes(' a ') || dataLimpa.includes(' até ') || dataLimpa.includes(' - ')) {
    const separadores = [' a ', ' até ', ' - ', ' ao '];
    for (const sep of separadores) {
      if (dataLimpa.includes(sep)) {
        dataLimpa = dataLimpa.split(sep)[0].trim();
        break;
      }
    }
  }
  
  const regexData = /^(\d{4})-(\d{2})-(\d{2})$/;
  
  if (!regexData.test(dataLimpa)) {
    return dataLimpa; // Retorna original se não for YYYY-MM-DD
  }
  
  const [, ano, mes, dia] = dataLimpa.match(regexData) || [];
  return `${dia}/${mes}/${ano}`;
};

// Funções para exames laboratoriais
export const saveExamesLaboratoriais = async (
  patientId: string, 
  examesData: Partial<ExamesLaboratoriais>
): Promise<{ error: any }> => {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase não configurado') };
  }

  try {
    // Converter datas para formato do Supabase antes de salvar
    const dadosParaSalvar = {
      patient_id: patientId,
      ...examesData,
      data_lab_pre: converterDataParaSupabase(examesData.data_lab_pre),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('exames_laboratoriais')
      .upsert(dadosParaSalvar, {
        onConflict: 'patient_id'
      });

    return { error };
  } catch (error) {
    return { error };
  }
};

export const getExamesLaboratoriais = async (
  patientId: string
): Promise<{ data: ExamesLaboratoriais | null, error: any }> => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase não configurado') };
  }

  try {
    const { data, error } = await supabase
      .from('exames_laboratoriais')
      .select('*')
      .eq('patient_id', patientId);

    if (error) {
      console.error('Erro ao buscar laboratoriais:', error);
      return { data: null, error };
    }

    // Retorna o primeiro registro ou null se não encontrar
    const laboratorial = data && data.length > 0 ? data[0] : null;
    return { data: laboratorial, error: null };
  } catch (error) {
    console.error('Erro na requisição de laboratoriais:', error);
    return { data: null, error };
  }
};

export const getPacientesSemLaboratoriais = async (): Promise<{ 
  data: PacienteSimples[], 
  error: any 
}> => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: new Error('Supabase não configurado') };
  }

  try {
    // Primeiro, buscar todos os pacientes
    const { data: allPatients, error: patientsError } = await supabase
      .from('patients')
      .select(`
        id,
        num,
        nome,
        prontuario,
        data_cirurgia
      `)
      .order('nome', { ascending: true });

    if (patientsError) throw patientsError;

    // Depois, buscar pacientes que já têm laboratoriais
    let patientsWithLabs: string[] = [];
    try {
      const { data: labsData } = await supabase
        .from('exames_laboratoriais')
        .select('patient_id');
      
      patientsWithLabs = labsData?.map(l => l.patient_id) || [];
    } catch (labsError) {
      // Se a tabela não existir, todos pacientes estarão sem laboratoriais
      console.log('Tabela exames_laboratoriais não existe ainda, todos pacientes estarão disponíveis');
    }

    // Filtrar pacientes que não têm laboratoriais
    const patientsWithoutLabs = allPatients?.filter(p => !patientsWithLabs.includes(p.id)) || [];

    return { data: patientsWithoutLabs, error: null };
  } catch (error) {
    return { data: [], error };
  }
};

export const deleteExamesLaboratoriais = async (
  patientId: string
): Promise<{ error: any }> => {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase não configurado') };
  }

  try {
    const { error } = await supabase
      .from('exames_laboratoriais')
      .delete()
      .eq('patient_id', patientId);

    return { error };
  } catch (error) {
    return { error };
  }
};

export const checkPacienteTemLaboratoriais = async (
  patientId: string
): Promise<{ hasLabs: boolean, error: any }> => {
  if (!isSupabaseConfigured()) {
    return { hasLabs: false, error: new Error('Supabase não configurado') };
  }

  try {
    const { data, error } = await supabase
      .from('exames_laboratoriais')
      .select('id')
      .eq('patient_id', patientId)
      .single();

    const hasLabs = !!data;
    return { hasLabs, error };
  } catch (error) {
    return { hasLabs: false, error };
  }
};
