// Funções utilitárias para manipulação de datas

/**
 * Converte uma data para o formato DD/MM/YYYY
 * Aceita diversos formatos de entrada: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, etc.
 */
export const normalizarData = (data: string): string => {
  if (!data || data.trim() === '') {
    return '';
  }

  // Remove espaços em branco extras
  data = data.trim();

  // Se já está no formato DD/MM/YYYY, retorna como está
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    return data;
  }

  // Tenta converter de diversos formatos
  try {
    // Formato ISO: YYYY-MM-DD ou YYYY/MM/DD
    if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(data)) {
      const [ano, mes, dia] = data.split(/[-/]/);
      return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
    }

    // Formato MM/DD/YYYY ou MM-DD-YYYY
    if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(data)) {
      const [mes, dia, ano] = data.split(/[-/]/);
      return `${dia}/${mes}/${ano}`;
    }

    // Formato D/M/YYYY (com dia ou mês de um dígito)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(data)) {
      const [dia, mes, ano] = data.split('/');
      return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
    }

    // Formato D-M-YYYY (com dia ou mês de um dígito)
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(data)) {
      const [dia, mes, ano] = data.split('-');
      return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
    }

    // Tentativa com Date.parse para formatos não reconhecidos
    const parsedDate = new Date(data);
    if (!isNaN(parsedDate.getTime())) {
      const dia = parsedDate.getDate().toString().padStart(2, '0');
      const mes = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
      const ano = parsedDate.getFullYear();
      return `${dia}/${mes}/${ano}`;
    }

  } catch (error) {
    console.warn('Erro ao normalizar data:', data, error);
  }

  // Se não conseguir converter, retorna o valor original
  return data;
};

/**
 * Lista de campos de data que precisam ser normalizados
 */
export const CAMPOS_DATA = [
  'dataPrimeiraConsulta',
  'dataEmissaoAIH', 
  'dataCirurgia',
  'edaPosData',
  'usgPosData'
];

/**
 * Normaliza todos os campos de data em um objeto de paciente
 */
export const normalizarDatasPaciente = (paciente: any): any => {
  const pacienteNormalizado = { ...paciente };
  
  CAMPOS_DATA.forEach(campo => {
    if (pacienteNormalizado[campo]) {
      pacienteNormalizado[campo] = normalizarData(pacienteNormalizado[campo]);
    }
  });

  return pacienteNormalizado;
};
