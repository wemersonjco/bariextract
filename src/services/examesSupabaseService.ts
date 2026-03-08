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

// Funções para exames laboratoriais
export const saveExamesLaboratoriais = async (
  patientId: string, 
  examesData: Partial<ExamesLaboratoriais>
): Promise<{ error: any }> => {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase não configurado') };
  }

  try {
    const { error } = await supabase
      .from('exames_laboratoriais')
      .upsert({
        patient_id: patientId,
        ...examesData,
        updated_at: new Date().toISOString()
      }, {
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
      .eq('patient_id', patientId)
      .single();

    return { data, error };
  } catch (error) {
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
