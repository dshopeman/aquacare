import { useState, useRef, useCallback } from 'react'

interface SOSButtonProps {
  onSOS: () => void
  hidden?: boolean
}

export default function SOSButton({ onSOS, hidden }: SOSButtonProps) {
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  const startHold = useCallback(() => {
    startTimeRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const pct = Math.min((elapsed / 2000) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(intervalRef.current!)
        intervalRef.current = null
        setProgress(0)
        onSOS()
      }
    }, 50)
  }, [onSOS])

  const stopHold = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setProgress(0)
  }, [])

  if (hidden) return null

  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDash = (progress / 100) * circumference

  return (
    <button
      onPointerDown={startHold}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      aria-label="SOS - Segure 2 segundos para chamar ajuda"
      className="fixed bottom-20 right-4 z-50 w-16 h-16 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-xl border-4 border-red-800 select-none"
    >
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="4"
        />
        <circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-sm font-bold z-10 leading-none">SOS</span>
      <span className="text-[9px] z-10 leading-none opacity-80">Segure 2s</span>
    </button>
  )
}
