interface SliderProps {
  min: number
  max: number
  step?: number
  value: number
  onChange: (v: number) => void
  label?: string
  unit?: string
  colorGradient?: boolean
  disabled?: boolean
}

export default function Slider({
  min, max, step = 1, value, onChange, label, unit, colorGradient, disabled
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  const trackStyle = colorGradient
    ? { background: `linear-gradient(to right, #3b82f6 0%, #22c55e 40%, #f59e0b 70%, #ef4444 100%)` }
    : { background: `linear-gradient(to right, #d97706 ${pct}%, #e5e7eb ${pct}%)` }

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-amber-800">{label}</span>
          <span className="text-2xl font-bold text-amber-900">
            {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
            {unit && <span className="text-lg ml-1 text-amber-700">{unit}</span>}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-4 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={trackStyle}
      />
      <div className="flex justify-between text-sm text-amber-600">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}
