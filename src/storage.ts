import type { AppData, Preset } from './types'

const STORAGE_KEY = 'aquacare-data'

const defaultAssento = {
  alturaCm: 50,
  inclinacao: 0,
  rotacao: 0,
  apoioBracos: 'levantado' as const,
}

export const defaultPresets: Preset[] = [
  {
    id: 'preset-bom-dia',
    nome: 'Bom Dia, Campeão',
    icone: '🌅',
    assento: defaultAssento,
    agua: {
      temperaturaC: 37,
      pressao: 6,
      modoJato: 'continuo',
      zonas: ['costas', 'ombros'],
      direcoes: {},
    },
    produtos: {
      sabonete: { on: true, qtd: 'medio', tipo: 'neutro' },
      shampoo: { on: true, qtd: 'pouco', tipo: 'normal' },
      condicionador: { on: false, qtd: 'pouco' },
      hidratante: { on: false, qtd: 'pouco' },
    },
    ambiente: {
      som: 'radio_animado',
      volume: 60,
      luz: { cor: 'quente', intensidade: 80 },
      temporizadorMin: 12,
    },
    duracaoMin: 12,
  },
  {
    id: 'preset-spa',
    nome: 'Spa da Tarde',
    icone: '🧖',
    assento: { ...defaultAssento, inclinacao: 15 },
    agua: {
      temperaturaC: 38,
      pressao: 3,
      modoJato: 'neblina',
      zonas: ['costas', 'lombar', 'ombros'],
      direcoes: {},
    },
    produtos: {
      sabonete: { on: true, qtd: 'medio', tipo: 'perfumado' },
      shampoo: { on: false, qtd: 'pouco', tipo: 'hidratante' },
      condicionador: { on: false, qtd: 'pouco' },
      hidratante: { on: true, qtd: 'muito' },
    },
    ambiente: {
      som: 'natureza',
      volume: 40,
      luz: { cor: 'quente', intensidade: 50 },
      temporizadorMin: 20,
    },
    duracaoMin: 20,
  },
  {
    id: 'preset-chuva',
    nome: 'Chuva de Verão',
    icone: '🌧️',
    assento: defaultAssento,
    agua: {
      temperaturaC: 37,
      pressao: 5,
      modoJato: 'continuo',
      zonas: ['ombros', 'costas', 'lombar', 'pernas', 'pes'],
      direcoes: {},
    },
    produtos: {
      sabonete: { on: true, qtd: 'medio', tipo: 'neutro' },
      shampoo: { on: true, qtd: 'medio', tipo: 'normal' },
      condicionador: { on: true, qtd: 'medio' },
      hidratante: { on: true, qtd: 'medio' },
    },
    ambiente: {
      som: 'silencio',
      volume: 0,
      luz: { cor: 'neutra', intensidade: 70 },
      temporizadorMin: 15,
    },
    duracaoMin: 15,
  },
  {
    id: 'preset-noite',
    nome: 'Banho da Noite',
    icone: '🌙',
    assento: defaultAssento,
    agua: {
      temperaturaC: 36.5,
      pressao: 2,
      modoJato: 'continuo',
      zonas: ['costas', 'lombar'],
      direcoes: {},
    },
    produtos: {
      sabonete: { on: true, qtd: 'pouco', tipo: 'neutro' },
      shampoo: { on: false, qtd: 'pouco', tipo: 'normal' },
      condicionador: { on: false, qtd: 'pouco' },
      hidratante: { on: false, qtd: 'pouco' },
    },
    ambiente: {
      som: 'mpb',
      volume: 30,
      luz: { cor: 'quente', intensidade: 30 },
      temporizadorMin: 10,
    },
    duracaoMin: 10,
  },
]

const defaultData: AppData = {
  perfis: [],
  perfilAtivoId: undefined,
  presets: defaultPresets,
  historicoBanhos: [],
  configApp: {
    tema: 'claro',
    tamanhoFonte: 'grande',
    leituraPorVoz: false,
    idioma: 'pt-BR',
  },
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultData, presets: [...defaultPresets] }
    const parsed = JSON.parse(raw) as AppData
    // Ensure presets exist if empty
    if (!parsed.presets || parsed.presets.length === 0) {
      parsed.presets = [...defaultPresets]
    }
    return parsed
  } catch {
    return { ...defaultData, presets: [...defaultPresets] }
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    console.error('Erro ao salvar dados')
  }
}
