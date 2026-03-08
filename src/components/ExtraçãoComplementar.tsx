import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  extractExamesLaboratoriais 
} from '../services/examesLaboratoriaisService';
import { 
  getPacientesSemLaboratoriais,
  saveExamesLaboratoriais,
  checkPacienteTemLaboratoriais
} from '../services/examesSupabaseService';
import { ExamesLaboratoriais } from '../types';

type PacienteSimples = {
  id: string;
  num: string;
  nome: string;
  prontuario: string;
  data_cirurgia: string;
};

interface ExtraçãoComplementarProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExtraçãoComplementar({ onClose, onSuccess }: ExtraçãoComplementarProps) {
  const [pacientes, setPacientes] = useState<PacienteSimples[]>([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState<PacienteSimples[]>([]);
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteSimples | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [prontuarioText, setProntuarioText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadPacientes();
  }, []);

  useEffect(() => {
    const filtered = pacientes.filter(p => 
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prontuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.num.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setPacientesFiltrados(filtered);
  }, [searchTerm, pacientes]);

  const loadPacientes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getPacientesSemLaboratoriais();
      if (error) {
        console.error('Erro ao carregar pacientes:', error);
        setErrorMessage(`Erro ao carregar lista de pacientes: ${error.message}`);
        setStatus('error');
      } else {
        setPacientes(data || []);
        console.log('Pacientes carregados:', data?.length || 0);
      }
    } catch (error: any) {
      console.error('Erro ao carregar pacientes:', error);
      setErrorMessage(`Erro ao carregar lista de pacientes: ${error.message}`);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!selectedPaciente || !prontuarioText.trim()) {
      setErrorMessage('Selecione um paciente e cole o texto do prontuário');
      setStatus('error');
      return;
    }

    setIsProcessing(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      // Verificar se já tem laboratoriais
      const { hasLabs } = await checkPacienteTemLaboratoriais(selectedPaciente.id);
      
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
      const { error } = await saveExamesLaboratoriais(selectedPaciente.id, examesData);
      
      if (error) {
        console.error('Erro ao salvar laboratoriais:', error);
        setErrorMessage('Erro ao salvar exames laboratoriais');
        setStatus('error');
      } else {
        setStatus('success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Erro na extração:', error);
      setErrorMessage(error.message || 'Erro ao processar exames laboratoriais');
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Extração Complementar - Exames Laboratoriais
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Status Messages */}
          {status === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-green-800">
                Laboratoriais de {selectedPaciente?.nome} extraídos com sucesso!
              </span>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{errorMessage}</span>
            </div>
          )}

          {/* Search and Patient Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Paciente
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, prontuário ou número..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Patient List */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pacientes Sem Laboratoriais
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                    <span className="text-gray-600">Carregando pacientes...</span>
                  </div>
                ) : pacientesFiltrados.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {searchTerm ? 'Nenhum paciente encontrado' : 'Todos os pacientes já possuem laboratoriais'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {pacientesFiltrados.map((paciente) => (
                      <div
                        key={paciente.id}
                        onClick={() => setSelectedPaciente(paciente)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedPaciente?.id === paciente.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{paciente.nome}</div>
                            <div className="text-sm text-gray-600">
                              Prontuário: {paciente.prontuario} | Nº: {paciente.num}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{paciente.data_cirurgia || 'Sem data'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prontuário Text Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prontuário do Paciente
            </label>
            <textarea
              value={prontuarioText}
              onChange={(e) => setProntuarioText(e.target.value)}
              placeholder="Cole o texto do prontuário aqui..."
              className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={!selectedPaciente}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button
              onClick={handleExtract}
              disabled={!selectedPaciente || !prontuarioText.trim() || isProcessing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extraindo...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Extrair Laboratoriais</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
