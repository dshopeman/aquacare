import { useState, useEffect, useCallback } from 'react'
import type {
  AssentoState,
  AguaState,
  ProdutosState,
  AmbienteState,
  ZonaCorporal,
  ModoJato,
  DirecaoJato,
  Som,
  QtdProduto,
  TipoSabonete,
  TipoShampoo,
  Preset,
} from '../types'
import { useApp } from '../context/AppContext'
import SOSButton from '../components/SOSButton'
import Slider from '../components/Slider'

interface Props {
  presetInicial?: Preset
  onNavigate: (tela: string) => void
  onEncerrar: (estado: {
    assento: AssentoState
    agua: AguaState
    produtos: ProdutosState
    ambiente: AmbienteState
    duracaoMin: number
  }) => void
}

type Tab = 'assento' | 'agua' | 'produtos' | 'ambiente'

const DEFAULT_ASSENTO: AssentoState = {
  alturaCm: 50,
  inclinacao: 0,
  rotacao: 0,
  apoioBracos: 'levantado',
}

const DEFAULT_AGUA: AguaState = {
  temperaturaC: 37,
  pressao: 5,
  modoJato: 'continuo',
  zonas: ['costas'],
  direcoes: {},
}

const DEFAULT_PRODUTOS: ProdutosState = {
  sabonete: { on: true, qtd: 'medio', tipo: 'neutro' },
  shampoo: { on: true, qtd: 'medio', tipo: 'normal' },
  condicionador: { on: false, qtd: 'pouco' },
  hidratante: { on: false, qtd: 'pouco' },
}

const DEFAULT_AMBIENTE: AmbienteState = {
  som: 'silencio',
  volume: 50,
  luz: { cor: 'neutra', intensidade: 80 },
  temporizadorMin: 0,
}

const ZONAS: { id: ZonaCorporal; label: string }[] = [
  { id: 'ombros', label: '💪 Ombros' },
  { id: 'costas', label: '🔙 Costas' },
  { id: 'lombar', label: '⬇️ Lombar' },
  { id: 'pernas', label: '🦵 Pernas' },
  { id: 'pes', label: '🦶 Pés' },
]

const MODOS_JATO: { id: ModoJato; label: string }[] = [
  { id: 'continuo', label: 'Contínuo' },
  { id: 'pulsante', label: 'Pulsante 💓' },
  { id: 'massageador', label: 'Massageador 💆' },
  { id: 'neblina', label: 'Neblina 🌫️' },
]

const DIRECOES: { id: DirecaoJato; label: string }[] = [
  { id: 'cima', label: '↑ Cima' },
  { id: 'baixo', label: '↓ Baixo' },
  { id: 'esquerda', label: '← Esquerda' },
  { id: 'direita', label: '→ Direita' },
  { id: 'oscilante', label: '↔ Oscilante' },
]

const SONS: { id: Som; label: string }[] = [
  { id: 'silencio', label: '🤫 Silêncio' },
  { id: 'radio_classico', label: '🎼 Clássica' },
  { id: 'mpb', label: '🎵 MPB' },
  { id: 'natureza', label: '🌿 Natureza' },
  { id: 'radio_animado', label: '🎉 Animado' },
]

const QTDS: { id: QtdProduto; label: string }[] = [
  { id: 'pouco', label: 'Pouco' },
  { id: 'medio', label: 'Médio' },
  { id: 'muito', label: 'Muito' },
]

const TIPOS_SABONETE: { id: TipoSabonete; label: string }[] = [
  { id: 'neutro', label: 'Neutro' },
  { id: 'perfumado', label: 'Perfumado' },
  { id: 'hipoalergenico', label: 'Hipoalergênico' },
]

const TIPOS_SHAMPOO: { id: TipoShampoo; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'anti_caspa', label: 'Anticaspa' },
  { id: 'hidratante', label: 'Hidratante' },
]

const SEQUENCIA_BANHO = [
  { num: 1, emoji: '💦', titulo: 'Molhar', descricao: 'Abrir a água e molhar o corpo' },
  { num: 2, emoji: '🧴', titulo: 'Sabonete', descricao: 'Aplicar sabonete nas zonas ativas' },
  { num: 3, emoji: '🚿', titulo: 'Enxágue', descricao: 'Enxaguar o sabonete' },
  { num: 4, emoji: '🧖', titulo: 'Shampoo', descricao: 'Lavar o cabelo com shampoo' },
  { num: 5, emoji: '✨', titulo: 'Condicionador', descricao: 'Aplicar condicionador' },
  { num: 6, emoji: '💧', titulo: 'Enxágue Final', descricao: 'Enxaguar completamente' },
]

function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function BanhoScreen({ presetInicial, onNavigate, onEncerrar }: Props) {
  const { perfilAtivo } = useApp()

  const maxTemp = perfilAtivo?.sensibilidadeTermicaReduzida ? 39 : 41

  const [tabAtiva, setTabAtiva] = useState<Tab>('agua')
  const [assento, setAssento] = useState<AssentoState>(presetInicial?.assento ?? DEFAULT_ASSENTO)
  const [agua, setAgua] = useState<AguaState>(presetInicial?.agua ?? DEFAULT_AGUA)
  const [produtos, setProdutos] = useState<ProdutosState>(presetInicial?.produtos ?? DEFAULT_PRODUTOS)
  const [ambiente, setAmbiente] = useState<AmbienteState>(presetInicial?.ambiente ?? DEFAULT_AMBIENTE)
  const [inicioMs] = useState<number>(() => Date.now())
  const [tempoDecorrido, setTempoDecorrido] = useState<number>(0)
  const [zonaAtiva, setZonaAtiva] = useState<ZonaCorporal | null>(null)

  useEffect(() => {
    const id = setInterval(() => {
      setTempoDecorrido(Math.floor((Date.now() - inicioMs) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [inicioMs])

  const setTemperatura = useCallback((v: number) => {
    const clamped = Math.max(32, Math.min(maxTemp, v))
    setAgua(prev => ({ ...prev, temperaturaC: clamped }))
  }, [maxTemp])

  const toggleZona = useCallback((zona: ZonaCorporal) => {
    setAgua(prev => {
      const ativas = prev.zonas.includes(zona)
        ? prev.zonas.filter(z => z !== zona)
        : [...prev.zonas, zona]
      return { ...prev, zonas: ativas }
    })
    setZonaAtiva(prev => (prev === zona ? null : zona))
  }, [])

  const setDirecao = useCallback((zona: ZonaCorporal, dir: DirecaoJato) => {
    setAgua(prev => ({
      ...prev,
      direcoes: { ...prev.direcoes, [zona]: dir },
    }))
  }, [])

  const handleEncerrar = useCallback(() => {
    const duracaoMin = tempoDecorrido / 60
    onEncerrar({ assento, agua, produtos, ambiente, duracaoMin })
  }, [assento, agua, produtos, ambiente, tempoDecorrido, onEncerrar])

  // Temperature display helpers
  const temp = agua.temperaturaC
  const tempColor =
    temp < 35 ? 'text-blue-500' :
    temp <= 38 ? 'text-green-600' :
    temp <= 39 ? 'text-amber-500' :
    'text-red-600'
  const tempStatus = temp >= 36 && temp <= 38 ? '✅' : '⚠️'
  const nearMax = temp >= maxTemp - 0.5

  // Timer countdown
  const timerRestanteS =
    ambiente.temporizadorMin > 0
      ? Math.max(0, ambiente.temporizadorMin * 60 - tempoDecorrido)
      : null

  const TABS: { id: Tab; label: string }[] = [
    { id: 'assento', label: '🪑 Assento' },
    { id: 'agua', label: '🚿 Água' },
    { id: 'produtos', label: '🧴 Produtos' },
    { id: 'ambiente', label: '🎵 Ambiente' },
  ]

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col">
      {/* Sticky tab bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-sky-200 shadow-sm">
        <div className="flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabAtiva(tab.id)}
              className={[
                'flex-1 py-3 px-1 text-xs sm:text-sm font-semibold transition-colors border-b-2',
                tabAtiva === tab.id
                  ? 'border-sky-500 text-sky-700 bg-sky-50'
                  : 'border-transparent text-gray-500 hover:text-sky-600 hover:bg-sky-50',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-32">

        {/* ─── TAB: ASSENTO ─── */}
        {tabAtiva === 'assento' && (
          <div className="p-4 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <Slider
                label="Altura do Assento"
                min={35}
                max={70}
                step={1}
                value={assento.alturaCm}
                onChange={v => setAssento(prev => ({ ...prev, alturaCm: v }))}
                unit="cm"
              />
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <Slider
                label="Inclinação"
                min={0}
                max={45}
                step={1}
                value={assento.inclinacao}
                onChange={v => setAssento(prev => ({ ...prev, inclinacao: v }))}
                unit="°"
              />
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <Slider
                label="Rotação"
                min={-90}
                max={90}
                step={5}
                value={assento.rotacao}
                onChange={v => setAssento(prev => ({ ...prev, rotacao: v }))}
                unit="°"
              />
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <p className="text-lg font-medium text-amber-800 mb-3">Apoio dos Braços</p>
              <div className="flex gap-3">
                {(['recolhido', 'levantado'] as const).map(opcao => (
                  <button
                    key={opcao}
                    onClick={() => setAssento(prev => ({ ...prev, apoioBracos: opcao }))}
                    className={[
                      'flex-1 py-4 rounded-xl text-base font-semibold border-2 transition-colors',
                      assento.apoioBracos === opcao
                        ? 'bg-amber-100 border-amber-500 text-amber-800'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-amber-300',
                    ].join(' ')}
                  >
                    {opcao === 'recolhido' ? 'Recolhido' : 'Levantado'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: ÁGUA ─── */}
        {tabAtiva === 'agua' && (
          <div className="p-4 flex flex-col gap-5">
            {/* Temperature display */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-semibold text-gray-600">Temperatura</span>
                <span className="text-3xl">{tempStatus}</span>
              </div>
              <div className={['text-6xl font-bold text-center py-2', tempColor].join(' ')}>
                {temp % 1 === 0 ? temp : temp.toFixed(1)}°C
              </div>
              {nearMax && (
                <div className="mt-2 bg-red-50 border border-red-300 rounded-xl px-3 py-2 text-sm text-red-700 font-medium text-center">
                  🚨 Próximo do limite máximo de temperatura!
                </div>
              )}
              {perfilAtivo?.sensibilidadeTermicaReduzida && temp > 38 && (
                <div className="mt-2 bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-sm text-amber-800 font-medium text-center">
                  ⚠️ Temperatura acima do recomendado para este perfil!
                </div>
              )}
              <div className="mt-4">
                <Slider
                  min={32}
                  max={maxTemp}
                  step={0.5}
                  value={temp}
                  onChange={setTemperatura}
                  colorGradient
                />
              </div>
            </div>

            {/* Pressão */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <Slider
                label="Pressão da Água"
                min={1}
                max={10}
                step={1}
                value={agua.pressao}
                onChange={v => setAgua(prev => ({ ...prev, pressao: v }))}
                unit=""
              />
              <div className="flex gap-1 mt-3 justify-center">
                {Array.from({ length: Math.min(agua.pressao, 10) }).map((_, i) => {
                  const scale = i < 5 ? 1 : 0.75
                  return (
                    <span
                      key={i}
                      style={{ fontSize: `${1.25 * scale}rem`, lineHeight: 1 }}
                    >
                      💧
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Modo do jato */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <p className="text-base font-semibold text-gray-700 mb-3">Modo do Jato</p>
              <div className="flex flex-wrap gap-2">
                {MODOS_JATO.map(modo => (
                  <button
                    key={modo.id}
                    onClick={() => setAgua(prev => ({ ...prev, modoJato: modo.id }))}
                    className={[
                      'px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors',
                      agua.modoJato === modo.id
                        ? 'bg-sky-500 border-sky-500 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-sky-300',
                    ].join(' ')}
                  >
                    {modo.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mapa corporal */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <p className="text-base font-semibold text-gray-700 mb-3">Zonas de Jato</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ZONAS.map(zona => {
                  const ativa = agua.zonas.includes(zona.id)
                  return (
                    <button
                      key={zona.id}
                      onClick={() => toggleZona(zona.id)}
                      className={[
                        'py-3 px-2 rounded-xl text-sm font-semibold border-2 transition-colors',
                        ativa
                          ? 'bg-blue-100 border-blue-500 text-blue-800'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300',
                      ].join(' ')}
                    >
                      {zona.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Controle de direção */}
            {zonaAtiva !== null && agua.zonas.includes(zonaAtiva) && (
              <div className="bg-blue-50 rounded-2xl p-4 shadow-sm border border-blue-200">
                <p className="text-base font-semibold text-blue-800 mb-1">
                  Direção — {ZONAS.find(z => z.id === zonaAtiva)?.label}
                </p>
                <p className="text-xs text-blue-600 mb-3">Selecione a direção do jato para esta zona</p>
                <div className="flex flex-wrap gap-2">
                  {DIRECOES.map(dir => {
                    const atual = agua.direcoes[zonaAtiva]
                    return (
                      <button
                        key={dir.id}
                        onClick={() => setDirecao(zonaAtiva, dir.id)}
                        className={[
                          'px-4 py-2 rounded-xl text-sm font-medium border-2 transition-colors',
                          atual === dir.id
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-white border-blue-200 text-blue-700 hover:border-blue-400',
                        ].join(' ')}
                      >
                        {dir.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: PRODUTOS ─── */}
        {tabAtiva === 'produtos' && (
          <div className="p-4 flex flex-col gap-4">
            {/* Sabonete */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-gray-800">🧼 Sabonete</span>
                <button
                  onClick={() =>
                    setProdutos(prev => ({
                      ...prev,
                      sabonete: { ...prev.sabonete, on: !prev.sabonete.on },
                    }))
                  }
                  className={[
                    'w-14 h-7 rounded-full transition-colors relative',
                    produtos.sabonete.on ? 'bg-green-500' : 'bg-gray-300',
                  ].join(' ')}
                  aria-label="Ativar sabonete"
                >
                  <span
                    className={[
                      'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform',
                      produtos.sabonete.on ? 'translate-x-7' : 'translate-x-0.5',
                    ].join(' ')}
                  />
                </button>
              </div>
              {produtos.sabonete.on && (
                <>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Quantidade</p>
                  <div className="flex gap-2 mb-4">
                    {QTDS.map(q => (
                      <button
                        key={q.id}
                        onClick={() =>
                          setProdutos(prev => ({
                            ...prev,
                            sabonete: { ...prev.sabonete, qtd: q.id },
                          }))
                        }
                        className={[
                          'flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors',
                          produtos.sabonete.qtd === q.id
                            ? 'bg-amber-100 border-amber-500 text-amber-800'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-amber-300',
                        ].join(' ')}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Tipo</p>
                  <div className="flex gap-2">
                    {TIPOS_SABONETE.map(t => (
                      <button
                        key={t.id}
                        onClick={() =>
                          setProdutos(prev => ({
                            ...prev,
                            sabonete: { ...prev.sabonete, tipo: t.id },
                          }))
                        }
                        className={[
                          'flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-colors',
                          produtos.sabonete.tipo === t.id
                            ? 'bg-sky-100 border-sky-500 text-sky-800'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-sky-300',
                        ].join(' ')}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Shampoo */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-gray-800">🧴 Shampoo</span>
                <button
                  onClick={() =>
                    setProdutos(prev => ({
                      ...prev,
                      shampoo: { ...prev.shampoo, on: !prev.shampoo.on },
                    }))
                  }
                  className={[
                    'w-14 h-7 rounded-full transition-colors relative',
                    produtos.shampoo.on ? 'bg-green-500' : 'bg-gray-300',
                  ].join(' ')}
                  aria-label="Ativar shampoo"
                >
                  <span
                    className={[
                      'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform',
                      produtos.shampoo.on ? 'translate-x-7' : 'translate-x-0.5',
                    ].join(' ')}
                  />
                </button>
              </div>
              {produtos.shampoo.on && (
                <>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Quantidade</p>
                  <div className="flex gap-2 mb-4">
                    {QTDS.map(q => (
                      <button
                        key={q.id}
                        onClick={() =>
                          setProdutos(prev => ({
                            ...prev,
                            shampoo: { ...prev.shampoo, qtd: q.id },
                          }))
                        }
                        className={[
                          'flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors',
                          produtos.shampoo.qtd === q.id
                            ? 'bg-amber-100 border-amber-500 text-amber-800'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-amber-300',
                        ].join(' ')}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Tipo</p>
                  <div className="flex gap-2">
                    {TIPOS_SHAMPOO.map(t => (
                      <button
                        key={t.id}
                        onClick={() =>
                          setProdutos(prev => ({
                            ...prev,
                            shampoo: { ...prev.shampoo, tipo: t.id },
                          }))
                        }
                        className={[
                          'flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-colors',
                          produtos.shampoo.tipo === t.id
                            ? 'bg-sky-100 border-sky-500 text-sky-800'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-sky-300',
                        ].join(' ')}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Condicionador */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-gray-800">💆 Condicionador</span>
                <button
                  onClick={() =>
                    setProdutos(prev => ({
                      ...prev,
                      condicionador: { ...prev.condicionador, on: !prev.condicionador.on },
                    }))
                  }
                  className={[
                    'w-14 h-7 rounded-full transition-colors relative',
                    produtos.condicionador.on ? 'bg-green-500' : 'bg-gray-300',
                  ].join(' ')}
                  aria-label="Ativar condicionador"
                >
                  <span
                    className={[
                      'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform',
                      produtos.condicionador.on ? 'translate-x-7' : 'translate-x-0.5',
                    ].join(' ')}
                  />
                </button>
              </div>
              {produtos.condicionador.on && (
                <>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Quantidade</p>
                  <div className="flex gap-2">
                    {QTDS.map(q => (
                      <button
                        key={q.id}
                        onClick={() =>
                          setProdutos(prev => ({
                            ...prev,
                            condicionador: { ...prev.condicionador, qtd: q.id },
                          }))
                        }
                        className={[
                          'flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors',
                          produtos.condicionador.qtd === q.id
                            ? 'bg-amber-100 border-amber-500 text-amber-800'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-amber-300',
                        ].join(' ')}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Hidratante */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-gray-800">🧈 Hidratante</span>
                <button
                  onClick={() =>
                    setProdutos(prev => ({
                      ...prev,
                      hidratante: { ...prev.hidratante, on: !prev.hidratante.on },
                    }))
                  }
                  className={[
                    'w-14 h-7 rounded-full transition-colors relative',
                    produtos.hidratante.on ? 'bg-green-500' : 'bg-gray-300',
                  ].join(' ')}
                  aria-label="Ativar hidratante"
                >
                  <span
                    className={[
                      'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform',
                      produtos.hidratante.on ? 'translate-x-7' : 'translate-x-0.5',
                    ].join(' ')}
                  />
                </button>
              </div>
              {produtos.hidratante.on && (
                <>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Quantidade</p>
                  <div className="flex gap-2">
                    {QTDS.map(q => (
                      <button
                        key={q.id}
                        onClick={() =>
                          setProdutos(prev => ({
                            ...prev,
                            hidratante: { ...prev.hidratante, qtd: q.id },
                          }))
                        }
                        className={[
                          'flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors',
                          produtos.hidratante.qtd === q.id
                            ? 'bg-amber-100 border-amber-500 text-amber-800'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-amber-300',
                        ].join(' ')}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sequência do banho */}
            <div className="mt-2">
              <p className="text-base font-bold text-gray-700 mb-3">📋 Sequência do Banho</p>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {SEQUENCIA_BANHO.map(step => (
                  <div
                    key={step.num}
                    className="flex-shrink-0 w-40 bg-white rounded-2xl p-3 shadow-sm border border-sky-100 flex flex-col items-center text-center gap-1"
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold">
                      {step.num}
                    </span>
                    <span className="text-2xl">{step.emoji}</span>
                    <span className="text-sm font-bold text-gray-800">{step.titulo}</span>
                    <span className="text-xs text-gray-500 leading-tight">{step.descricao}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: AMBIENTE ─── */}
        {tabAtiva === 'ambiente' && (
          <div className="p-4 flex flex-col gap-5">
            {/* Som */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <p className="text-base font-semibold text-gray-700 mb-3">Música / Som</p>
              <div className="flex flex-col gap-2">
                {SONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setAmbiente(prev => ({ ...prev, som: s.id }))}
                    className={[
                      'w-full py-3 px-4 rounded-xl text-sm font-medium border-2 text-left transition-colors',
                      ambiente.som === s.id
                        ? 'bg-purple-100 border-purple-500 text-purple-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-purple-300',
                    ].join(' ')}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <Slider
                  label="Volume"
                  min={0}
                  max={100}
                  step={5}
                  value={ambiente.volume}
                  onChange={v => setAmbiente(prev => ({ ...prev, volume: v }))}
                  unit="%"
                  disabled={ambiente.som === 'silencio'}
                />
              </div>
            </div>

            {/* Luz */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <p className="text-base font-semibold text-gray-700 mb-3">Iluminação</p>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Cor da Luz</p>
              <div className="flex gap-2 mb-4">
                {(
                  [
                    { id: 'quente', label: '🟡 Quente' },
                    { id: 'fria', label: '🔵 Fria' },
                    { id: 'neutra', label: '⚪ Neutra' },
                  ] as { id: 'quente' | 'fria' | 'neutra'; label: string }[]
                ).map(cor => (
                  <button
                    key={cor.id}
                    onClick={() =>
                      setAmbiente(prev => ({
                        ...prev,
                        luz: { ...prev.luz, cor: cor.id },
                      }))
                    }
                    className={[
                      'flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors',
                      ambiente.luz.cor === cor.id
                        ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-yellow-300',
                    ].join(' ')}
                  >
                    {cor.label}
                  </button>
                ))}
              </div>
              <Slider
                label="Intensidade"
                min={0}
                max={100}
                step={5}
                value={ambiente.luz.intensidade}
                onChange={v =>
                  setAmbiente(prev => ({
                    ...prev,
                    luz: { ...prev.luz, intensidade: v },
                  }))
                }
                unit="%"
              />
            </div>

            {/* Temporizador */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <p className="text-base font-semibold text-gray-700 mb-3">⏱️ Temporizador</p>
              {timerRestanteS !== null ? (
                <div className="text-center">
                  <div
                    className={[
                      'text-5xl font-mono font-bold mb-1',
                      timerRestanteS === 0 ? 'text-red-600' : 'text-sky-700',
                    ].join(' ')}
                  >
                    {formatMmSs(timerRestanteS)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {timerRestanteS === 0 ? 'Tempo esgotado!' : 'restante'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center">Nenhum temporizador ativo</p>
              )}
              <div className="mt-4">
                <Slider
                  label="Duração"
                  min={0}
                  max={60}
                  step={1}
                  value={ambiente.temporizadorMin}
                  onChange={v => setAmbiente(prev => ({ ...prev, temporizadorMin: v }))}
                  unit=" min"
                />
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Tempo decorrido: {tempoDecorrido}s
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg px-4 py-3">
        <button
          onClick={handleEncerrar}
          className="w-full py-4 rounded-2xl bg-red-100 text-red-700 border-2 border-red-300 font-bold text-lg active:scale-95 transition-transform"
        >
          🔚 Encerrar Banho
        </button>
      </div>

      {/* SOS Button */}
      <SOSButton onSOS={() => onNavigate('sos')} />
    </div>
  )
}
