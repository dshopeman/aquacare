import type { Tema, TamanhoFonte } from '../types'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'
import SOSButton from '../components/SOSButton'

interface Props {
  onNavigate: (tela: string) => void
}

const TEMAS: { value: Tema; label: string; icon: string }[] = [
  { value: 'claro', label: 'Claro', icon: '☀️' },
  { value: 'escuro', label: 'Escuro', icon: '🌙' },
]

const FONTES: { value: TamanhoFonte; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'grande', label: 'Grande' },
  { value: 'muito_grande', label: 'Muito Grande' },
]

export default function ConfigScreen({ onNavigate }: Props) {
  const { data, saveAndUpdate } = useApp()
  const config = data.configApp

  function atualizarTema(tema: Tema) {
    saveAndUpdate({
      ...data,
      configApp: { ...config, tema },
    })
  }

  function atualizarFonte(tamanhoFonte: TamanhoFonte) {
    saveAndUpdate({
      ...data,
      configApp: { ...config, tamanhoFonte },
    })
  }

  function toggleVoz() {
    const novoValor = !config.leituraPorVoz
    saveAndUpdate({
      ...data,
      configApp: { ...config, leituraPorVoz: novoValor },
    })
    if (novoValor) {
      try {
        const fala = new SpeechSynthesisUtterance('Leitura por voz ativada')
        fala.lang = 'pt-BR'
        window.speechSynthesis.speak(fala)
      } catch {
        // speechSynthesis não disponível — ignorar
      }
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-24">
      {/* Header */}
      <div className="bg-amber-600 text-white px-6 pt-10 pb-6">
        <h1 className="text-3xl font-bold">⚙️ Configurações</h1>
      </div>

      <div className="px-4 pt-6 space-y-5">
        {/* Aparência */}
        <section className="bg-white rounded-3xl shadow-md p-6 space-y-5">
          <h2 className="text-xl font-bold text-amber-900">Aparência</h2>

          {/* Tema */}
          <div>
            <p className="text-lg font-semibold text-amber-800 mb-3">Tema</p>
            <div className="grid grid-cols-2 gap-3">
              {TEMAS.map(t => (
                <button
                  key={t.value}
                  onClick={() => atualizarTema(t.value)}
                  className={`min-h-[64px] rounded-2xl border-2 flex flex-col items-center justify-center gap-1 text-lg font-semibold transition-all ${
                    config.tema === t.value
                      ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                      : 'border-amber-300 bg-white text-amber-900 hover:border-amber-400'
                  }`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tamanho da fonte */}
          <div>
            <p className="text-lg font-semibold text-amber-800 mb-3">Tamanho da fonte</p>
            <div className="flex flex-col gap-3">
              {FONTES.map(f => (
                <button
                  key={f.value}
                  onClick={() => atualizarFonte(f.value)}
                  className={`min-h-[56px] rounded-2xl border-2 px-5 py-3 text-left font-semibold transition-all ${
                    config.tamanhoFonte === f.value
                      ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                      : 'border-amber-300 bg-white text-amber-900 hover:border-amber-400'
                  } ${
                    f.value === 'normal'
                      ? 'text-base'
                      : f.value === 'grande'
                      ? 'text-lg'
                      : 'text-xl'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Acessibilidade */}
        <section className="bg-white rounded-3xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-bold text-amber-900">Acessibilidade</h2>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-lg font-semibold text-amber-800">Leitura por voz</p>
              <p className="text-sm text-amber-600 mt-0.5">
                Narração de elementos em voz alta
              </p>
            </div>
            <button
              onClick={toggleVoz}
              aria-pressed={config.leituraPorVoz}
              className={`relative inline-flex h-10 w-20 items-center rounded-full border-2 transition-all flex-shrink-0 ${
                config.leituraPorVoz
                  ? 'border-amber-500 bg-amber-500'
                  : 'border-amber-300 bg-amber-100'
              }`}
            >
              <span
                className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-transform ${
                  config.leituraPorVoz ? 'translate-x-10' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Idioma */}
        <section className="bg-white rounded-3xl shadow-md p-6">
          <h2 className="text-xl font-bold text-amber-900 mb-2">Idioma</h2>
          <div className="flex items-center gap-3 py-2">
            <span className="text-3xl">🇧🇷</span>
            <p className="text-lg font-semibold text-amber-800">Português (Brasil)</p>
          </div>
        </section>

        {/* Sobre */}
        <section className="bg-white rounded-3xl shadow-md p-6 space-y-2">
          <h2 className="text-xl font-bold text-amber-900">Sobre</h2>
          <div className="space-y-1 pt-1">
            <p className="text-base text-amber-700">
              <span className="font-semibold">Versão</span> 1.0.0
            </p>
            <p className="text-base text-amber-700 leading-relaxed">
              Desenvolvido com ❤️ para facilitar o banho assistido de idosos.
            </p>
          </div>
        </section>
      </div>

      <SOSButton onSOS={() => onNavigate('sos')} />
      <BottomNav current="config" onNavigate={tela => onNavigate(tela)} />
    </div>
  )
}
