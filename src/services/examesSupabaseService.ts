import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ExamesLaboratoriais, PatientData } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
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
  data: Array<Pick<PatientData, 'id' | 'num' | 'nome' | 'prontuario' | 'dataCirurgia'>>, 
  error: any 
}> => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: new Error('Supabase não configurado') };
  }

  try {
    // Busca pacientes que não têm registros na tabela exames_laboratoriais
    const { data, error } = await supabase
      .from('patients')
      .select(`
        id,
        num,
        nome,
        prontuario,
        dataCirurgia
      `)
      .is('exames_laboratoriais.patient_id', null)
      .order('nome', { ascending: true });

    if (error) throw error;

    return { data: data || [], error: null };
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
