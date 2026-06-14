export type Mobilidade = 'independente' | 'apoio_leve' | 'cadeira_banho' | 'assistencia_total'
export type SensibilidadePele = 'normal' | 'sensivel' | 'muito_sensivel'
export type Genero = 'masculino' | 'feminino' | 'nao_informar' | 'outro'
export type ModoJato = 'continuo' | 'pulsante' | 'massageador' | 'neblina'
export type ZonaCorporal = 'ombros' | 'costas' | 'lombar' | 'pernas' | 'pes'
export type DirecaoJato = 'cima' | 'baixo' | 'esquerda' | 'direita' | 'oscilante'
export type Som = 'silencio' | 'radio_classico' | 'mpb' | 'natureza' | 'radio_animado'
export type QtdProduto = 'pouco' | 'medio' | 'muito'
export type TipoSabonete = 'neutro' | 'perfumado' | 'hipoalergenico'
export type TipoShampoo = 'normal' | 'anti_caspa' | 'hidratante'
export type Tema = 'claro' | 'escuro'
export type TamanhoFonte = 'normal' | 'grande' | 'muito_grande'

export interface ContatoEmergencia { nome: string; telefone: string }

export interface Perfil {
  id: string
  nome: string
  dataNascimento: string
  genero: Genero
  alturaCm: number
  pesoKg?: number
  mobilidade: Mobilidade
  sensibilidadePele: SensibilidadePele
  sensibilidadeTermicaReduzida: boolean
  alergias: string[]
  somPreferido: Som
  contatoEmergencia: ContatoEmergencia
  pinCuidador: string
  presets: string[]
  presetFavoritoId?: string
  avatar?: string
}

export interface AssentoState {
  alturaCm: number
  inclinacao: number
  rotacao: number
  apoioBracos: 'recolhido' | 'levantado'
}

export interface AguaState {
  temperaturaC: number
  pressao: number
  modoJato: ModoJato
  zonas: ZonaCorporal[]
  direcoes: Partial<Record<ZonaCorporal, DirecaoJato>>
}

export interface ProdutoConfig {
  on: boolean
  qtd: QtdProduto
}

export interface ProdutosState {
  sabonete: ProdutoConfig & { tipo: TipoSabonete }
  shampoo: ProdutoConfig & { tipo: TipoShampoo }
  condicionador: ProdutoConfig
  hidratante: ProdutoConfig
}

export interface AmbienteState {
  som: Som
  volume: number
  luz: { cor: 'quente' | 'fria' | 'neutra'; intensidade: number }
  temporizadorMin: number
}

export interface Preset {
  id: string
  nome: string
  icone: string
  assento: AssentoState
  agua: AguaState
  produtos: ProdutosState
  ambiente: AmbienteState
  duracaoMin: number
}

export interface HistoricoBanho {
  data: string
  presetId?: string
  presetNome?: string
  duracaoMin: number
  temperaturaMediaC: number
}

export interface ConfigApp {
  tema: Tema
  tamanhoFonte: TamanhoFonte
  leituraPorVoz: boolean
  idioma: string
}

export interface AppData {
  perfis: Perfil[]
  perfilAtivoId?: string
  presets: Preset[]
  historicoBanhos: HistoricoBanho[]
  configApp: ConfigApp
}
