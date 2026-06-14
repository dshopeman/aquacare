import { useEffect } from 'react'

interface Props {
  hasProfile: boolean
  onDone: (tela: 'home' | 'cadastro') => void
}

export default function SplashScreen({ hasProfile, onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(() => {
      onDone(hasProfile ? 'home' : 'cadastro')
    }, 2000)
    return () => clearTimeout(t)
  }, [hasProfile, onDone])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-300 via-amber-200 to-yellow-100 p-8">
      <div className="text-9xl mb-6 drop-shadow-lg">🛁</div>
      <h1 className="text-5xl font-bold text-amber-900 text-center mb-4 tracking-tight">
        AquaCare
      </h1>
      <p className="text-xl text-amber-700 text-center italic">
        Comfort, care, and dignity.
      </p>
      <div className="mt-12 flex gap-2">
        <div className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
