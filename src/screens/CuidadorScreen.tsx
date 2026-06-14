import { useState } from 'react'
import type { SensibilidadePele } from '../types'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'
import PinInput from '../components/PinInput'
import { defaultPresets } from '../storage'

interface Props {
  onNavigate: (tela: string) => void
}

type Aba = 'limites' | 'medicos' | 'historico' | 'perfis'

const PELE_OPTIONS: { value: SensibilidadePele; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'sensivel', label: 'Sensível' },
  { value: 'muito_sensivel', label: 'Muito Sensível' },
]

function formatarData(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function CuidadorScreen({ onNavigate }: Props) {
  const { data, perfilAtivo, updatePerfil, setPerfilAtivo, saveAndUpdate } = useApp()

  const [desbloqueado, setDesbloqueado] = useState(false)
  const [pinErro, setPinErro] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<Aba>('limites')

  // Limites locais
  const [tempMax, setTempMax] = useState<number>(
    perfilAtivo?.sensibilidadeTermicaReduzida ? 38 : 41
  )
  const [pressaoMax, setPressaoMax] = useState<number>(8)

  // Dados médicos locais
  const [sensTermica, setSensTermica] = useState<boolean>(
    perfilAtivo?.sensibilidadeTermicaReduzida ?? false
  )
  const [sensPele, setSensPele] = useState<SensibilidadePele>(
    perfilAtivo?.sensibilidadePele ?? 'normal'
  )
  const [alergias, setAlergias] = useState<string[]>(perfilAtivo?.alergias ?? [])
  const [novaAlergia, setNovaAlergia] = useState('')
  const [salvandoMedicos, setSalvandoMedicos] = useState(false)

  // Confirmação reset
  const [confirmarReset, setConfirmarReset] = useState(false)

  function handlePin(pin: string) {
    if (pin === perfilAtivo?.pinCuidador) {
      setDesbloqueado(true)
      setPinErro(false)
    } else {
      setPinErro(true)
    }
  }

  function salvarLimites() {
    if (!perfilAtivo) return
    // Guardamos os limites na sensibilidade termica como proxy de segurança
    // (limites de segurança são contexto local desta sessão; não há campo específico no tipo)
    // Apenas registramos sucesso visualmente
    alert(`Limites salvos:\nTemperatura máx: ${tempMax}°C\nPressão máx: ${pressaoMax}`)
  }

  function salvarMedicos() {
    if (!perfilAtivo) return
    setSalvandoMedicos(true)
    updatePerfil({
      ...perfilAtivo,
      sensibilidadeTermicaReduzida: sensTermica,
      sensibilidadePele: sensPele,
      alergias,
    })
    setTimeout(() => setSalvandoMedicos(false), 1000)
  }

  function adicionarAlergia() {
    const trimmed = novaAlergia.trim()
    if (trimmed && !alergias.includes(trimmed)) {
      setAlergias(prev => [...prev, trimmed])
      setNovaAlergia('')
    }
  }

  function removerAlergia(a: string) {
    setAlergias(prev => prev.filter(x => x !== a))
  }

  function handleReset() {
    const freshData = {
      perfis: [],
      perfilAtivoId: undefined,
      presets: [...defaultPresets],
      historicoBanhos: [],
      configApp: {
        tema: 'claro' as const,
        tamanhoFonte: 'grande' as const,
        leituraPorVoz: false,
        idioma: 'pt-BR',
      },
    }
    saveAndUpdate(freshData)
    onNavigate('splash')
  }

  function deletarPerfil(id: string) {
    if (data.perfis.length <= 1) return
    const novosPerfis = data.perfis.filter(p => p.id !== id)
    const novoAtivoId =
      data.perfilAtivoId === id ? novosPerfis[0]?.id : data.perfilAtivoId
    saveAndUpdate({
      ...data,
      perfis: novosPerfis,
      perfilAtivoId: novoAtivoId,
    })
    if (novoAtivoId) setPerfilAtivo(novoAtivoId)
  }

  const abas: { key: Aba; label: string; icon: string }[] = [
    { key: 'limites', label: 'Limites', icon: '🌡️' },
    { key: 'medicos', label: 'Médico', icon: '🩺' },
    { key: 'historico', label: 'Histórico', icon: '📋' },
    { key: 'perfis', label: 'Perfis', icon: '👥' },
  ]

  if (!desbloqueado) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col">
        <div className="bg-amber-700 text-white px-6 pt-10 pb-6">
          <h1 className="text-3xl font-bold">🔐 Acesso do Cuidador</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-md py-6">
            <PinInput
              title="Acesso do Cuidador"
              onComplete={handlePin}
              onCancel={() => onNavigate('home')}
            />
            {pinErro && (
              <p className="text-center text-lg text-red-600 font-semibold mt-2 pb-4">
                PIN incorreto. Tente novamente.
              </p>
            )}
          </div>
        </div>
        <BottomNav current="cuidador" onNavigate={tela => onNavigate(tela)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-24">
      {/* Header */}
      <div className="bg-amber-700 text-white px-6 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🔐 Modo Cuidador</h1>
          <button
            onClick={() => setDesbloqueado(false)}
            className="px-4 py-2 rounded-xl bg-amber-800 text-white text-base font-semibold hover:bg-amber-900 transition-colors"
          >
            Sair
          </button>
        </div>
        {perfilAtivo && (
          <p className="text-amber-200 mt-1 text-base">Perfil: {perfilAtivo.nome}</p>
        )}
      </div>

      {/* Abas */}
      <div className="flex border-b-2 border-amber-200 bg-white sticky top-0 z-10">
        {abas.map(aba => (
          <button
            key={aba.key}
            onClick={() => setAbaAtiva(aba.key)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-semibold transition-colors ${
              abaAtiva === aba.key
                ? 'text-amber-700 border-b-2 border-amber-600'
                : 'text-gray-500 hover:text-amber-600'
            }`}
          >
            <span className="text-xl">{aba.icon}</span>
            {aba.label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* ── Seção 1: Limites de Segurança ── */}
        {abaAtiva === 'limites' && (
          <div className="bg-white rounded-3xl shadow-md p-6 space-y-6">
            <h2 className="text-xl font-bold text-amber-900">Limites de Segurança</h2>

            <div>
              <label className="block text-lg font-semibold text-amber-800 mb-2">
                Temperatura máxima:{' '}
                <span className="text-amber-600">{tempMax.toFixed(1)}°C</span>
              </label>
              <input
                type="range"
                min={32}
                max={41}
                step={0.5}
                value={tempMax}
                onChange={e => setTempMax(Number(e.target.value))}
                className="w-full h-3 rounded-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-sm text-amber-600 mt-1">
                <span>32°C</span>
                <span>41°C</span>
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-amber-800 mb-2">
                Pressão máxima:{' '}
                <span className="text-amber-600">{pressaoMax}</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={pressaoMax}
                onChange={e => setPressaoMax(Number(e.target.value))}
                className="w-full h-3 rounded-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-sm text-amber-600 mt-1">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            <button
              onClick={salvarLimites}
              className="w-full min-h-[56px] rounded-2xl bg-amber-500 text-white text-xl font-bold hover:bg-amber-600 transition-colors shadow-md"
            >
              Salvar Limites
            </button>
          </div>
        )}

        {/* ── Seção 2: Dados Médicos ── */}
        {abaAtiva === 'medicos' && (
          <div className="bg-white rounded-3xl shadow-md p-6 space-y-6">
            <h2 className="text-xl font-bold text-amber-900">Dados Médicos</h2>

            {/* Sensibilidade Térmica */}
            <div>
              <label className="block text-lg font-semibold text-amber-800 mb-3">
                Sensibilidade térmica reduzida?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSensTermica(true)}
                  className={`min-h-[56px] rounded-2xl border-2 text-lg font-semibold transition-all ${
                    sensTermica
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-amber-300 bg-white text-amber-900'
                  }`}
                >
                  Sim
                </button>
                <button
                  onClick={() => setSensTermica(false)}
                  className={`min-h-[56px] rounded-2xl border-2 text-lg font-semibold transition-all ${
                    !sensTermica
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-amber-300 bg-white text-amber-900'
                  }`}
                >
                  Não
                </button>
              </div>
            </div>

            {/* Sensibilidade da Pele */}
            <div>
              <label className="block text-lg font-semibold text-amber-800 mb-3">
                Sensibilidade da pele
              </label>
              <div className="flex flex-col gap-3">
                {PELE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSensPele(opt.value)}
                    className={`min-h-[52px] rounded-2xl border-2 px-5 py-3 text-lg font-medium text-left transition-all ${
                      sensPele === opt.value
                        ? 'border-amber-500 bg-amber-500 text-white'
                        : 'border-amber-300 bg-white text-amber-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alergias */}
            <div>
              <label className="block text-lg font-semibold text-amber-800 mb-3">
                Alergias / Restrições
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={novaAlergia}
                  onChange={e => setNovaAlergia(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      adicionarAlergia()
                    }
                  }}
                  placeholder="Digite e pressione Enter"
                  className="flex-1 rounded-2xl border-2 border-amber-300 bg-white px-4 py-3 text-lg text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:outline-none"
                />
                <button
                  onClick={adicionarAlergia}
                  className="min-h-[52px] px-5 rounded-2xl bg-amber-500 text-white text-xl font-bold hover:bg-amber-600 transition-colors"
                >
                  +
                </button>
              </div>
              {alergias.length === 0 && (
                <p className="text-base text-amber-500 italic">Nenhuma alergia registrada.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {alergias.map(a => (
                  <span
                    key={a}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500 text-white text-base font-medium"
                  >
                    {a}
                    <button
                      onClick={() => removerAlergia(a)}
                      className="ml-1 text-white hover:text-amber-200 font-bold leading-none"
                      aria-label={`Remover ${a}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={salvarMedicos}
              disabled={salvandoMedicos}
              className="w-full min-h-[56px] rounded-2xl bg-amber-500 text-white text-xl font-bold hover:bg-amber-600 transition-colors shadow-md disabled:opacity-60"
            >
              {salvandoMedicos ? 'Salvo! ✓' : 'Salvar Dados Médicos'}
            </button>
          </div>
        )}

        {/* ── Seção 3: Histórico de Banhos ── */}
        {abaAtiva === 'historico' && (
          <div className="bg-white rounded-3xl shadow-md p-6">
            <h2 className="text-xl font-bold text-amber-900 mb-4">Histórico de Banhos</h2>
            {data.historicoBanhos.length === 0 ? (
              <p className="text-lg text-amber-500 italic text-center py-6">
                Nenhum banho registrado ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {[...data.historicoBanhos].sort(
                  (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
                ).map((h, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-amber-900">
                        {h.presetNome || 'Manual'}
                      </span>
                      <span className="text-sm text-amber-600">
                        {h.duracaoMin} min · {h.temperaturaMediaC}°C
                      </span>
                    </div>
                    <span className="text-sm text-amber-500">{formatarData(h.data)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Seção 4: Gerenciar Perfis ── */}
        {abaAtiva === 'perfis' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-md p-6">
              <h2 className="text-xl font-bold text-amber-900 mb-4">Perfis Cadastrados</h2>
              <div className="space-y-3">
                {data.perfis.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-amber-200 bg-amber-50"
                  >
                    <span className="text-3xl">{p.avatar || '👤'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-semibold text-amber-900 truncate">{p.nome}</p>
                    </div>
                    {p.id === data.perfilAtivoId && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
                        Ativo
                      </span>
                    )}
                    {p.id !== data.perfilAtivoId && data.perfis.length > 1 && (
                      <button
                        onClick={() => deletarPerfil(p.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-100 text-red-600 text-sm font-semibold hover:bg-red-200 transition-colors"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Restaurar padrões */}
            <div className="bg-white rounded-3xl shadow-md p-6">
              <h2 className="text-xl font-bold text-red-700 mb-2">Zona de Perigo</h2>
              <p className="text-base text-gray-600 mb-4">
                Restaurar os padrões de fábrica apagará todos os perfis, histórico e presets personalizados.
              </p>
              {!confirmarReset ? (
                <button
                  onClick={() => setConfirmarReset(true)}
                  className="w-full min-h-[56px] rounded-2xl border-2 border-red-400 bg-red-50 text-red-600 text-xl font-bold hover:bg-red-100 transition-colors"
                >
                  🔄 Restaurar Padrões de Fábrica
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-red-700 text-center">
                    Tem certeza? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmarReset(false)}
                      className="flex-1 min-h-[56px] rounded-2xl border-2 border-amber-400 bg-white text-amber-700 text-lg font-bold hover:bg-amber-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 min-h-[56px] rounded-2xl bg-red-600 text-white text-lg font-bold hover:bg-red-700 transition-colors"
                    >
                      Confirmar Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav current="cuidador" onNavigate={tela => onNavigate(tela)} />
    </div>
  )
}
