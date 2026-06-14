import React, { createContext, useContext, useState, useCallback } from 'react'
import type { AppData, Perfil, Preset, HistoricoBanho } from '../types'
import { loadData, saveData } from '../storage'

interface AppContextValue {
  data: AppData
  setData: React.Dispatch<React.SetStateAction<AppData>>
  perfilAtivo: Perfil | undefined
  saveAndUpdate: (data: AppData) => void
  addPerfil: (perfil: Perfil) => void
  updatePerfil: (perfil: Perfil) => void
  setPerfilAtivo: (id: string) => void
  addPreset: (preset: Preset) => void
  updatePreset: (preset: Preset) => void
  deletePreset: (id: string) => void
  addHistorico: (h: HistoricoBanho) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())

  const saveAndUpdate = useCallback((newData: AppData) => {
    saveData(newData)
    setData(newData)
  }, [])

  const perfilAtivo = data.perfis.find(p => p.id === data.perfilAtivoId)

  const addPerfil = useCallback((perfil: Perfil) => {
    setData(prev => {
      const newData = {
        ...prev,
        perfis: [...prev.perfis, perfil],
        perfilAtivoId: prev.perfilAtivoId ?? perfil.id,
      }
      saveData(newData)
      return newData
    })
  }, [])

  const updatePerfil = useCallback((perfil: Perfil) => {
    setData(prev => {
      const newData = {
        ...prev,
        perfis: prev.perfis.map(p => p.id === perfil.id ? perfil : p),
      }
      saveData(newData)
      return newData
    })
  }, [])

  const setPerfilAtivo = useCallback((id: string) => {
    setData(prev => {
      const newData = { ...prev, perfilAtivoId: id }
      saveData(newData)
      return newData
    })
  }, [])

  const addPreset = useCallback((preset: Preset) => {
    setData(prev => {
      const newData = { ...prev, presets: [...prev.presets, preset] }
      saveData(newData)
      return newData
    })
  }, [])

  const updatePreset = useCallback((preset: Preset) => {
    setData(prev => {
      const newData = {
        ...prev,
        presets: prev.presets.map(p => p.id === preset.id ? preset : p),
      }
      saveData(newData)
      return newData
    })
  }, [])

  const deletePreset = useCallback((id: string) => {
    setData(prev => {
      const newData = {
        ...prev,
        presets: prev.presets.filter(p => p.id !== id),
        perfis: prev.perfis.map(p => ({
          ...p,
          presets: p.presets.filter(pid => pid !== id),
          presetFavoritoId: p.presetFavoritoId === id ? undefined : p.presetFavoritoId,
        })),
      }
      saveData(newData)
      return newData
    })
  }, [])

  const addHistorico = useCallback((h: HistoricoBanho) => {
    setData(prev => {
      const newData = {
        ...prev,
        historicoBanhos: [h, ...prev.historicoBanhos].slice(0, 100),
      }
      saveData(newData)
      return newData
    })
  }, [])

  return (
    <AppContext.Provider value={{
      data,
      setData,
      perfilAtivo,
      saveAndUpdate,
      addPerfil,
      updatePerfil,
      setPerfilAtivo,
      addPreset,
      updatePreset,
      deletePreset,
      addHistorico,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
