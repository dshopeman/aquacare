import { useState } from 'react'
import type { Preset, AssentoState, AguaState, ProdutosState, AmbienteState } from '../types'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'
import SOSButton from '../components/SOSButton'

interface Props {
  onNavigate: (tela: string) => void
  currentBanhoState?: {
    assento: AssentoState
    agua: AguaState
    produtos: ProdutosState
    ambiente: AmbienteState
  } | null
}

const ICONES = ['🌅', '🧖', '🌧️', '🌙', '🌊', '🌺', '💆', '🏊', '🌿', '🌸', '⭐', '🎶']

const SOM_LABELS: Record<string, string> = {
  silencio: 'Silêncio',
  radio_classico: 'Rádio Clássico',
  mpb: 'MPB',
  natureza: 'Sons da Natureza',
  radio_animado: 'Rádio Animado',
}

function gerarId() {
  return `preset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export default function PresetsScreen({ onNavigate, currentBanhoState }: Props) {
  const { data, addPreset, updatePreset, deletePreset, perfilAtivo, updatePerfil } = useApp()

  // Modal: salvar estado atual como preset
  const [showSalvarModal, setShowSalvarModal] = useState(false)
  const [salvarNome, setSalvarNome] = useState('')
  const [salvarIcone, setSalvarIcone] = useState(ICONES[0])
  const [salvarDuracao, setSalvarDuracao] = useState(15)

  // Modal: editar preset existente
  const [editandoPreset, setEditandoPreset] = useState<Preset | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editIcone, setEditIcone] = useState(ICONES[0])
  const [editDuracao, setEditDuracao] = useState(15)

  // Modal: confirmar exclusão
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  function handleSalvarAtual() {
    if (!currentBanhoState || !salvarNome.trim()) return
    const novoPreset: Preset = {
      id: gerarId(),
      nome: salvarNome.trim(),
      icone: salvarIcone,
      assento: currentBanhoState.assento,
      agua: currentBanhoState.agua,
      produtos: currentBanhoState.produtos,
      ambiente: { ...currentBanhoState.ambiente, temporizadorMin: salvarDuracao },
      duracaoMin: salvarDuracao,
    }
    addPreset(novoPreset)
    setShowSalvarModal(false)
    setSalvarNome('')
    setSalvarIcone(ICONES[0])
    setSalvarDuracao(15)
  }

  function abrirEdicao(preset: Preset) {
    setEditandoPreset(preset)
    setEditNome(preset.nome)
    setEditIcone(preset.icone)
    setEditDuracao(preset.duracaoMin)
  }

  function handleSalvarEdicao() {
    if (!editandoPreset || !editNome.trim()) return
    updatePreset({
      ...editandoPreset,
      nome: editNome.trim(),
      icone: editIcone,
      duracaoMin: editDuracao,
      ambiente: { ...editandoPreset.ambiente, temporizadorMin: editDuracao },
    })
    setEditandoPreset(null)
  }

  function handleExcluir() {
    if (!excluindoId) return
    deletePreset(excluindoId)
    setExcluindoId(null)
  }

  function toggleFavorito(presetId: string) {
    if (!perfilAtivo) return
    updatePerfil({
      ...perfilAtivo,
      presetFavoritoId: perfilAtivo.presetFavoritoId === presetId ? undefined : presetId,
    })
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 pt-8 pb-5">
        <h1 className="text-3xl font-bold text-gray-800">Meus Presets</h1>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Botão salvar estado atual */}
        <button
          disabled={!currentBanhoState}
          onClick={() => setShowSalvarModal(true)}
          className={`w-full min-h-16 text-xl font-semibold rounded-2xl border-2 transition-all
            ${currentBanhoState
              ? 'bg-green-50 border-green-400 text-green-700 active:scale-95'
              : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60'
            }`}
        >
          💾 Salvar estado atual como preset
        </button>

        {/* Lista de presets */}
        {data.presets.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">⭐</p>
            <p className="text-lg">Nenhum preset cadastrado ainda.</p>
            <p className="text-sm mt-2">Inicie um banho e salve suas preferências aqui.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.presets.map(preset => {
              const isFavorito = perfilAtivo?.presetFavoritoId === preset.id
              return (
                <div
                  key={preset.id}
                  className={`bg-white rounded-2xl shadow-sm border-2 p-5
                    ${isFavorito ? 'border-amber-400' : 'border-gray-200'}`}
                >
                  {/* Topo: ícone + nome + estrela */}
                  <div className="flex items-start gap-4">
                    <span className="text-4xl leading-none mt-1">{preset.icone}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-bold text-gray-800 leading-tight">{preset.nome}</p>
                      <p className="text-base text-gray-600 mt-1">
                        {preset.agua.temperaturaC}°C · Pressão {preset.agua.pressao} · {preset.duracaoMin}min
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Som: {SOM_LABELS[preset.ambiente.som] ?? preset.ambiente.som}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFavorito(preset.id)}
                      aria-label={isFavorito ? 'Remover favorito' : 'Definir como favorito'}
                      className="text-3xl p-1 active:scale-90 transition-transform"
                    >
                      <span className={isFavorito ? 'text-amber-400' : 'text-gray-300'}>⭐</span>
                    </button>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => abrirEdicao(preset)}
                      className="flex-1 min-h-12 bg-blue-50 text-blue-700 font-semibold text-lg rounded-xl border border-blue-200 active:scale-95 transition-transform"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => setExcluindoId(preset.id)}
                      className="flex-1 min-h-12 bg-red-50 text-red-700 font-semibold text-lg rounded-xl border border-red-200 active:scale-95 transition-transform"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav current="presets" onNavigate={(tela) => onNavigate(tela)} />
      <SOSButton onSOS={() => onNavigate('sos')} />

      {/* Modal: Salvar estado atual como preset */}
      {showSalvarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800">Salvar como Preset</h2>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Nome do preset</label>
              <input
                type="text"
                value={salvarNome}
                onChange={e => setSalvarNome(e.target.value)}
                placeholder="Ex: Banho relaxante"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Ícone</label>
              <div className="grid grid-cols-6 gap-2">
                {ICONES.map(icone => (
                  <button
                    key={icone}
                    onClick={() => setSalvarIcone(icone)}
                    className={`text-3xl p-2 rounded-xl border-2 transition-all
                      ${salvarIcone === icone ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-white'}`}
                  >
                    {icone}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Duração (minutos)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={salvarDuracao}
                onChange={e => setSalvarDuracao(Number(e.target.value))}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowSalvarModal(false)}
                className="flex-1 min-h-14 text-lg font-semibold rounded-2xl border-2 border-gray-300 text-gray-600 active:scale-95 transition-transform"
              >
                Cancelar
              </button>
              <button
                disabled={!salvarNome.trim()}
                onClick={handleSalvarAtual}
                className={`flex-1 min-h-14 text-lg font-bold rounded-2xl transition-all
                  ${salvarNome.trim()
                    ? 'bg-green-600 text-white active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                💾 Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar preset */}
      {editandoPreset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800">Editar Preset</h2>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                value={editNome}
                onChange={e => setEditNome(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Ícone</label>
              <div className="grid grid-cols-6 gap-2">
                {ICONES.map(icone => (
                  <button
                    key={icone}
                    onClick={() => setEditIcone(icone)}
                    className={`text-3xl p-2 rounded-xl border-2 transition-all
                      ${editIcone === icone ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-white'}`}
                  >
                    {icone}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Duração (minutos)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={editDuracao}
                onChange={e => setEditDuracao(Number(e.target.value))}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setEditandoPreset(null)}
                className="flex-1 min-h-14 text-lg font-semibold rounded-2xl border-2 border-gray-300 text-gray-600 active:scale-95 transition-transform"
              >
                Cancelar
              </button>
              <button
                disabled={!editNome.trim()}
                onClick={handleSalvarEdicao}
                className={`flex-1 min-h-14 text-lg font-bold rounded-2xl transition-all
                  ${editNome.trim()
                    ? 'bg-blue-600 text-white active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                ✏️ Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar exclusão */}
      {excluindoId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl text-center">
            <p className="text-5xl">🗑️</p>
            <h2 className="text-2xl font-bold text-gray-800">Tem certeza?</h2>
            <p className="text-gray-500 text-base">
              Este preset será removido permanentemente.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setExcluindoId(null)}
                className="flex-1 min-h-14 text-lg font-semibold rounded-2xl border-2 border-gray-300 text-gray-600 active:scale-95 transition-transform"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
                className="flex-1 min-h-14 text-lg font-bold rounded-2xl bg-red-600 text-white active:scale-95 transition-transform"
              >
                🗑️ Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
