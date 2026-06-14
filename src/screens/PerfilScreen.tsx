import { useState } from 'react'
import type { Mobilidade, SensibilidadePele } from '../types'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'
import SOSButton from '../components/SOSButton'
import CadastroScreen from './CadastroScreen'

interface Props {
  onNavigate: (tela: string) => void
}

const mobilidadeLabel: Record<Mobilidade, string> = {
  independente: 'Independente',
  apoio_leve: 'Apoio Leve',
  cadeira_banho: 'Cadeira de Banho',
  assistencia_total: 'Assistência Total',
}

const sensibilidadeLabel: Record<SensibilidadePele, string> = {
  normal: 'Normal',
  sensivel: 'Sensível',
  muito_sensivel: 'Muito Sensível',
}

function calcularIdade(dataNascimento: string): number {
  return Math.floor(
    (Date.now() - new Date(dataNascimento).getTime()) / (365.25 * 24 * 3600 * 1000)
  )
}

type ModoTela = 'ver' | 'editar' | 'novo'

export default function PerfilScreen({ onNavigate }: Props) {
  const { data, perfilAtivo, setPerfilAtivo } = useApp()
  const [modo, setModo] = useState<ModoTela>('ver')

  if (modo === 'editar' && perfilAtivo) {
    return (
      <CadastroScreen
        perfilInicial={perfilAtivo}
        onDone={() => setModo('ver')}
      />
    )
  }

  if (modo === 'novo') {
    return (
      <CadastroScreen
        onDone={() => setModo('ver')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-24">
      {/* Header */}
      <div className="bg-amber-600 text-white px-6 pt-10 pb-6">
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {perfilAtivo ? (
          <>
            {/* Card do perfil ativo */}
            <div className="bg-white rounded-3xl shadow-md p-6 flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-300 flex items-center justify-center text-5xl">
                {perfilAtivo.avatar || '👤'}
              </div>
              <h2 className="text-3xl font-bold text-amber-900">{perfilAtivo.nome}</h2>
              {perfilAtivo.dataNascimento && (
                <p className="text-xl text-amber-700">
                  {calcularIdade(perfilAtivo.dataNascimento)} anos
                </p>
              )}
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-base font-medium">
                  {mobilidadeLabel[perfilAtivo.mobilidade]}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-base font-medium">
                  {sensibilidadeLabel[perfilAtivo.sensibilidadePele]}
                </span>
              </div>
              {perfilAtivo.alergias.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {perfilAtivo.alergias.map(a => (
                    <span
                      key={a}
                      className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium"
                    >
                      ⚠️ {a}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => setModo('editar')}
                className="mt-3 w-full min-h-[56px] rounded-2xl bg-amber-500 text-white text-xl font-bold hover:bg-amber-600 active:bg-amber-700 transition-colors shadow-md"
              >
                ✏️ Editar Perfil
              </button>
            </div>

            {/* Trocar Perfil */}
            {data.perfis.length > 1 && (
              <div className="bg-white rounded-3xl shadow-md p-5">
                <h3 className="text-xl font-bold text-amber-900 mb-4">Trocar Perfil</h3>
                <div className="space-y-3">
                  {data.perfis.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPerfilAtivo(p.id)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                        p.id === perfilAtivo.id
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-amber-200 bg-white hover:border-amber-400'
                      }`}
                    >
                      <span className="text-3xl">{p.avatar || '👤'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-semibold text-amber-900 truncate">{p.nome}</p>
                        {p.dataNascimento && (
                          <p className="text-base text-amber-600">
                            {calcularIdade(p.dataNascimento)} anos · {mobilidadeLabel[p.mobilidade]}
                          </p>
                        )}
                      </div>
                      {p.id === perfilAtivo.id && (
                        <span className="text-amber-500 text-xl flex-shrink-0">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl shadow-md p-8 flex flex-col items-center gap-4">
            <span className="text-6xl">👤</span>
            <p className="text-xl text-amber-700 text-center">
              Nenhum perfil cadastrado ainda.
            </p>
          </div>
        )}

        {/* Novo Perfil */}
        <button
          onClick={() => setModo('novo')}
          className="w-full min-h-[60px] rounded-2xl border-2 border-dashed border-amber-400 bg-white text-amber-700 text-xl font-bold hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-2xl">➕</span> Novo Perfil
        </button>
      </div>

      <SOSButton onSOS={() => onNavigate('sos')} />
      <BottomNav current="perfil" onNavigate={tela => onNavigate(tela)} />
    </div>
  )
}
