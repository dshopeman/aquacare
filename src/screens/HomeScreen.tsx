import { useState, useEffect } from 'react'
import type { Preset } from '../types'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'
import SOSButton from '../components/SOSButton'

interface Props {
  onNavigate: (tela: string) => void
  onStartBanho: (preset?: Preset) => void
}

function getSaudacao(hora: number): { texto: string; emoji: string } {
  if (hora < 12) return { texto: 'Bom dia', emoji: '☀️' }
  if (hora < 18) return { texto: 'Boa tarde', emoji: '🌤️' }
  return { texto: 'Boa noite', emoji: '🌙' }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function HomeScreen({ onNavigate, onStartBanho }: Props) {
  const { perfilAtivo, data } = useApp()
  const [horaAtual, setHoraAtual] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setHoraAtual(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const saudacao = getSaudacao(horaAtual.getHours())

  const presetFavorito = perfilAtivo?.presetFavoritoId
    ? data.presets.find(p => p.id === perfilAtivo.presetFavoritoId)
    : undefined

  const outrosPresets = data.presets
    .filter(p => p.id !== presetFavorito?.id)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-amber-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 pt-8 pb-6">
        <p className="text-2xl font-semibold text-gray-700">
          {saudacao.texto}, {perfilAtivo?.nome ?? 'Usuário'}! {saudacao.emoji}
        </p>
        <p className="text-5xl font-bold text-amber-600 mt-2 tabular-nums tracking-tight">
          {formatTime(horaAtual)}
        </p>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Botão principal */}
        <button
          onClick={() => onStartBanho()}
          className="w-full min-h-20 text-2xl font-bold rounded-3xl bg-green-600 text-white shadow-lg active:scale-95 transition-transform"
        >
          🛁 Começar Banho
        </button>

        {/* Preset favorito */}
        {presetFavorito && (
          <div>
            <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-2 px-1">
              ⭐ Preferido
            </p>
            <button
              onClick={() => onStartBanho(presetFavorito)}
              className="w-full bg-amber-100 border-2 border-amber-400 rounded-2xl p-5 text-left shadow-sm active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{presetFavorito.icone}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-bold text-gray-800 truncate">{presetFavorito.nome}</p>
                  <p className="text-base text-gray-600 mt-1">
                    {presetFavorito.agua.temperaturaC}°C · {presetFavorito.ambiente.temporizadorMin}min
                  </p>
                </div>
                <span className="text-amber-500 text-2xl">▶</span>
              </div>
            </button>
          </div>
        )}

        {/* Outros presets */}
        {outrosPresets.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
              Presets
            </p>
            <div className="space-y-3">
              {outrosPresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => onStartBanho(preset)}
                  className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-left shadow-sm active:scale-95 transition-transform"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{preset.icone}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-bold text-gray-800 truncate">{preset.nome}</p>
                      <p className="text-base text-gray-500 mt-1">
                        {preset.agua.temperaturaC}°C · {preset.ambiente.temporizadorMin}min
                      </p>
                    </div>
                    <span className="text-gray-400 text-2xl">▶</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {data.presets.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-3">🛁</p>
            <p className="text-lg">Nenhum preset cadastrado ainda.</p>
            <button
              onClick={() => onNavigate('presets')}
              className="mt-4 text-amber-600 font-semibold text-base underline"
            >
              Criar um preset
            </button>
          </div>
        )}
      </div>

      <BottomNav current="home" onNavigate={(tela) => onNavigate(tela)} />
      <SOSButton onSOS={() => onNavigate('sos')} />
    </div>
  )
}
