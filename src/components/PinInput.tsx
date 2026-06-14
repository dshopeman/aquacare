import { useState } from 'react'

interface PinInputProps {
  onComplete: (pin: string) => void
  onCancel?: () => void
  title?: string
}

export default function PinInput({ onComplete, onCancel, title = 'Digite o PIN' }: PinInputProps) {
  const [digits, setDigits] = useState<string[]>([])

  const handleDigit = (d: string) => {
    if (digits.length >= 4) return
    const next = [...digits, d]
    setDigits(next)
    if (next.length === 4) {
      setTimeout(() => {
        onComplete(next.join(''))
        setDigits([])
      }, 200)
    }
  }

  const handleBackspace = () => {
    setDigits(prev => prev.slice(0, -1))
  }

  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <h2 className="text-3xl font-bold text-amber-900">{title}</h2>

      {/* Circles */}
      <div className="flex gap-4">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all
              ${i < digits.length
                ? 'bg-amber-600 border-amber-700'
                : 'bg-white border-amber-300'
              }`}
          >
            {i < digits.length && <div className="w-5 h-5 rounded-full bg-white" />}
          </div>
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {['1','2','3','4','5','6','7','8','9'].map(d => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="min-h-16 rounded-2xl bg-white border-2 border-amber-200 text-2xl font-bold text-amber-900 active:bg-amber-100 shadow"
          >
            {d}
          </button>
        ))}
        <button
          onClick={onCancel}
          className="min-h-16 rounded-2xl bg-red-50 border-2 border-red-200 text-lg font-bold text-red-600 active:bg-red-100 shadow"
        >
          ✕
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="min-h-16 rounded-2xl bg-white border-2 border-amber-200 text-2xl font-bold text-amber-900 active:bg-amber-100 shadow"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="min-h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 text-2xl font-bold text-amber-700 active:bg-amber-100 shadow"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
