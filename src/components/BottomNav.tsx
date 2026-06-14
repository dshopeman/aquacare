type Tela = 'home' | 'presets' | 'perfil' | 'cuidador' | 'config'

interface BottomNavProps {
  current: string
  onNavigate: (tela: Tela) => void
}

const items: { tela: Tela; icon: string; label: string }[] = [
  { tela: 'home', icon: '🏠', label: 'Início' },
  { tela: 'presets', icon: '⭐', label: 'Presets' },
  { tela: 'perfil', icon: '👤', label: 'Perfil' },
  { tela: 'cuidador', icon: '🔐', label: 'Cuidador' },
  { tela: 'config', icon: '⚙️', label: 'Config' },
]

export default function BottomNav({ current, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-[480px] mx-auto bg-white border-t-2 border-amber-200 flex">
      {items.map(({ tela, icon, label }) => (
        <button
          key={tela}
          onClick={() => onNavigate(tela)}
          className={`flex-1 flex flex-col items-center justify-center min-h-[60px] gap-1 transition-colors
            ${current === tela
              ? 'bg-amber-50 text-amber-700'
              : 'text-gray-500 hover:bg-amber-50'
            }`}
        >
          <span className="text-2xl">{icon}</span>
          <span className="text-xs font-medium">{label}</span>
        </button>
      ))}
    </nav>
  )
}
