import { useState, useCallback } from 'react'
import { AppProvider } from './context/AppContext'
import { useApp } from './context/AppContext'
import type { Preset, AssentoState, AguaState, ProdutosState, AmbienteState } from './types'

import SplashScreen from './screens/SplashScreen'
import CadastroScreen from './screens/CadastroScreen'
import HomeScreen from './screens/HomeScreen'
import BanhoScreen from './screens/BanhoScreen'
import PresetsScreen from './screens/PresetsScreen'
import PerfilScreen from './screens/PerfilScreen'
import CuidadorScreen from './screens/CuidadorScreen'
import SOSScreen from './screens/SOSScreen'
import ConfigScreen from './screens/ConfigScreen'

type Tela = 'splash' | 'home' | 'cadastro' | 'banho' | 'presets' | 'perfil' | 'cuidador' | 'sos' | 'config'

interface BanhoEstado {
  assento: AssentoState
  agua: AguaState
  produtos: ProdutosState
  ambiente: AmbienteState
  duracaoMin: number
}

function AppInner() {
  const { data, addHistorico } = useApp()
  const [tela, setTela] = useState<Tela>('splash')
  const [presetAtual, setPresetAtual] = useState<Preset | undefined>(undefined)
  const [ultimoBanhoEstado, setUltimoBanhoEstado] = useState<BanhoEstado | null>(null)

  const navigate = useCallback((t: string) => {
    setTela(t as Tela)
  }, [])

  const handleSplashDone = useCallback((destino: 'home' | 'cadastro') => {
    setTela(destino)
  }, [])

  const handleStartBanho = useCallback((preset?: Preset) => {
    setPresetAtual(preset)
    setTela('banho')
  }, [])

  const handleEncerrarBanho = useCallback((estado: BanhoEstado) => {
    setUltimoBanhoEstado(estado)
    addHistorico({
      data: new Date().toISOString(),
      presetId: presetAtual?.id,
      presetNome: presetAtual?.nome,
      duracaoMin: estado.duracaoMin,
      temperaturaMediaC: estado.agua.temperaturaC,
    })
    setTela('home')
  }, [addHistorico, presetAtual])

  const handleCadastroDone = useCallback(() => {
    setTela('home')
  }, [])

  switch (tela) {
    case 'splash':
      return (
        <SplashScreen
          hasProfile={data.perfis.length > 0}
          onDone={handleSplashDone}
        />
      )

    case 'cadastro':
      return (
        <CadastroScreen
          onDone={handleCadastroDone}
        />
      )

    case 'home':
      return (
        <HomeScreen
          onNavigate={navigate}
          onStartBanho={handleStartBanho}
        />
      )

    case 'banho':
      return (
        <BanhoScreen
          presetInicial={presetAtual}
          onNavigate={navigate}
          onEncerrar={handleEncerrarBanho}
        />
      )

    case 'presets':
      return (
        <PresetsScreen
          onNavigate={navigate}
          currentBanhoState={ultimoBanhoEstado}
        />
      )

    case 'perfil':
      return <PerfilScreen onNavigate={navigate} />

    case 'cuidador':
      return <CuidadorScreen onNavigate={navigate} />

    case 'sos':
      return <SOSScreen onNavigate={navigate} />

    case 'config':
      return <ConfigScreen onNavigate={navigate} />

    default:
      return (
        <HomeScreen
          onNavigate={navigate}
          onStartBanho={handleStartBanho}
        />
      )
  }

  // Suppress TS unreachable warning
  return null
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
