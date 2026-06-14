import { useEffect } from 'react'
import { useApp } from '../context/AppContext'

interface Props {
  onNavigate: (tela: string) => void
}

function playBeep() {
  try {
    const ctx = new AudioContext()
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.value = 0.3
      osc.start(ctx.currentTime + i * 0.5)
      osc.stop(ctx.currentTime + i * 0.5 + 0.3)
    }
  } catch {
    // AudioContext não disponível ou bloqueado — silenciar o erro
  }
}

function registrarSOS() {
  try {
    const KEY = 'aquacare-sos-log'
    const raw = localStorage.getItem(KEY)
    const log: { data: string }[] = raw ? JSON.parse(raw) : []
    log.push({ data: new Date().toISOString() })
    localStorage.setItem(KEY, JSON.stringify(log))
  } catch {
    // Falha ao acessar localStorage — ignorar
  }
}

export default function SOSScreen({ onNavigate }: Props) {
  const { perfilAtivo } = useApp()
  const contato = perfilAtivo?.contatoEmergencia

  useEffect(() => {
    playBeep()
    registrarSOS()
  }, [])

  return (
    <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center px-6 gap-8">
      {/* Ícone e título */}
      <div className="flex flex-col items-center gap-4">
        <span className="text-[100px] leading-none animate-pulse select-none">🆘</span>
        <h1 className="text-6xl font-black text-white tracking-tight text-center leading-tight">
          SOCORRO
        </h1>
      </div>

      {/* Instrução */}
      <p className="text-white text-xl text-center max-w-xs leading-relaxed">
        Ajuda está sendo chamada. Respire fundo, está tudo bem.
      </p>

      {/* Contato de emergência */}
      {contato && (contato.nome || contato.telefone) && (
        <div className="w-full max-w-sm bg-red-700 rounded-3xl p-5 flex flex-col gap-2 text-center">
          {contato.nome && (
            <p className="text-white text-lg font-semibold">{contato.nome}</p>
          )}
          {contato.telefone && (
            <p className="text-red-200 text-base">{contato.telefone}</p>
          )}
          {contato.telefone && (
            <a
              href={`tel:${contato.telefone.replace(/\D/g, '')}`}
              className="mt-2 block w-full min-h-[64px] rounded-2xl bg-white text-red-600 text-2xl font-black flex items-center justify-center shadow-xl hover:bg-red-50 active:bg-red-100 transition-colors"
            >
              📞 Ligar agora
            </a>
          )}
        </div>
      )}

      {/* Sem contato cadastrado */}
      {(!contato || (!contato.nome && !contato.telefone)) && (
        <div className="w-full max-w-sm bg-red-700 rounded-3xl p-5 text-center">
          <p className="text-red-200 text-base">
            Nenhum contato de emergência cadastrado.
          </p>
          <p className="text-white text-lg font-semibold mt-1">
            Ligue para o SAMU: 192
          </p>
          <a
            href="tel:192"
            className="mt-3 block w-full min-h-[64px] rounded-2xl bg-white text-red-600 text-2xl font-black flex items-center justify-center shadow-xl hover:bg-red-50 active:bg-red-100 transition-colors"
          >
            📞 Ligar 192
          </a>
        </div>
      )}

      {/* Botão cancelar */}
      <button
        onClick={() => onNavigate('home')}
        className="w-full max-w-sm min-h-[64px] rounded-2xl bg-red-800 text-white text-xl font-bold border-2 border-red-500 hover:bg-red-900 active:bg-red-950 transition-colors"
      >
        ✅ Estou bem / Cancelar
      </button>
    </div>
  )
}
