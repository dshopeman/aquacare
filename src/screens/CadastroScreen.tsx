import { useState } from 'react'
import type { Perfil, Genero, Mobilidade, SensibilidadePele, Som } from '../types'
import { useApp } from '../context/AppContext'

interface Props {
  onDone: () => void
  perfilInicial?: Perfil
}

interface FormState {
  nome: string
  dataNascimento: string
  genero: Genero | ''
  alturaCm: number
  pesoKg: string
  mobilidade: Mobilidade | ''
  sensibilidadePele: SensibilidadePele | ''
  sensibilidadeTermicaReduzida: boolean | null
  alergias: string[]
  alergiasInput: string
  somPreferido: Som | ''
  contatoEmergenciaNome: string
  contatoEmergenciaTelefone: string
  pinCuidador: string
}

const GENERO_OPTIONS: { value: Genero; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'nao_informar', label: 'Prefiro não informar' },
  { value: 'outro', label: 'Outro' },
]

const MOBILIDADE_OPTIONS: { value: Mobilidade; label: string }[] = [
  { value: 'independente', label: 'Independente 🚶' },
  { value: 'apoio_leve', label: 'Apoio Leve 🦯' },
  { value: 'cadeira_banho', label: 'Cadeira de Banho 🪑' },
  { value: 'assistencia_total', label: 'Assistência Total 🤝' },
]

const PELE_OPTIONS: { value: SensibilidadePele; label: string }[] = [
  { value: 'normal', label: 'Normal 👋' },
  { value: 'sensivel', label: 'Sensível 🌸' },
  { value: 'muito_sensivel', label: 'Muito Sensível 🌷' },
]

const SOM_OPTIONS: { value: Som; label: string }[] = [
  { value: 'silencio', label: 'Silêncio 🤫' },
  { value: 'radio_classico', label: 'Rádio Clássica 🎼' },
  { value: 'mpb', label: 'MPB 🎵' },
  { value: 'natureza', label: 'Sons da Natureza 🌿' },
  { value: 'radio_animado', label: 'Rádio Animado 🎉' },
]

const ALERGIA_TAGS = ['sem perfume', 'hipoalergênico', 'sem corante']

const TOTAL_STEPS = 4

function buildInitialState(perfilInicial?: Perfil): FormState {
  if (perfilInicial) {
    return {
      nome: perfilInicial.nome,
      dataNascimento: perfilInicial.dataNascimento,
      genero: perfilInicial.genero,
      alturaCm: perfilInicial.alturaCm,
      pesoKg: perfilInicial.pesoKg != null ? String(perfilInicial.pesoKg) : '',
      mobilidade: perfilInicial.mobilidade,
      sensibilidadePele: perfilInicial.sensibilidadePele,
      sensibilidadeTermicaReduzida: perfilInicial.sensibilidadeTermicaReduzida,
      alergias: [...perfilInicial.alergias],
      alergiasInput: '',
      somPreferido: perfilInicial.somPreferido,
      contatoEmergenciaNome: perfilInicial.contatoEmergencia.nome,
      contatoEmergenciaTelefone: perfilInicial.contatoEmergencia.telefone,
      pinCuidador: perfilInicial.pinCuidador,
    }
  }
  return {
    nome: '',
    dataNascimento: '',
    genero: '',
    alturaCm: 165,
    pesoKg: '',
    mobilidade: '',
    sensibilidadePele: '',
    sensibilidadeTermicaReduzida: null,
    alergias: [],
    alergiasInput: '',
    somPreferido: '',
    contatoEmergenciaNome: '',
    contatoEmergenciaTelefone: '',
    pinCuidador: '',
  }
}

export default function CadastroScreen({ onDone, perfilInicial }: Props) {
  const { addPerfil, updatePerfil } = useApp()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(() => buildInitialState(perfilInicial))
  const [errors, setErrors] = useState<string[]>([])

  const isEditing = Boolean(perfilInicial)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function validateStep(): string[] {
    const errs: string[] = []
    if (step === 1) {
      if (!form.nome.trim()) errs.push('Nome é obrigatório.')
      if (!form.dataNascimento) errs.push('Data de nascimento é obrigatória.')
      if (!form.genero) errs.push('Selecione um gênero.')
    }
    if (step === 2) {
      if (!form.alturaCm || form.alturaCm <= 0) errs.push('Informe a altura.')
      if (!form.mobilidade) errs.push('Selecione a mobilidade.')
    }
    if (step === 3) {
      if (!form.sensibilidadePele) errs.push('Selecione a sensibilidade da pele.')
      if (form.sensibilidadeTermicaReduzida === null) errs.push('Informe a sensibilidade térmica.')
    }
    if (step === 4) {
      if (!form.somPreferido) errs.push('Selecione o som preferido.')
      if (form.pinCuidador.length > 0 && form.pinCuidador.length !== 4)
        errs.push('O PIN deve ter exatamente 4 dígitos.')
    }
    return errs
  }

  function handleAvancar() {
    const errs = validateStep()
    if (errs.length > 0) {
      setErrors(errs)
      return
    }
    setErrors([])
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1)
    } else {
      handleSalvar()
    }
  }

  function handleVoltar() {
    setErrors([])
    setStep(s => Math.max(1, s - 1))
  }

  function handleSalvar() {
    const perfil: Perfil = {
      id: perfilInicial?.id ?? crypto.randomUUID(),
      nome: form.nome.trim(),
      dataNascimento: form.dataNascimento,
      genero: form.genero as Genero,
      alturaCm: form.alturaCm,
      pesoKg: form.pesoKg ? Number(form.pesoKg) : undefined,
      mobilidade: form.mobilidade as Mobilidade,
      sensibilidadePele: form.sensibilidadePele as SensibilidadePele,
      sensibilidadeTermicaReduzida: form.sensibilidadeTermicaReduzida as boolean,
      alergias: form.alergias,
      somPreferido: form.somPreferido as Som,
      contatoEmergencia: {
        nome: form.contatoEmergenciaNome.trim(),
        telefone: form.contatoEmergenciaTelefone.trim(),
      },
      pinCuidador: form.pinCuidador,
      presets: perfilInicial?.presets ?? [],
      presetFavoritoId: perfilInicial?.presetFavoritoId,
      avatar: perfilInicial?.avatar,
    }
    if (isEditing) {
      updatePerfil(perfil)
    } else {
      addPerfil(perfil)
    }
    onDone()
  }

  function addAlergia(tag: string) {
    const trimmed = tag.trim()
    if (trimmed && !form.alergias.includes(trimmed)) {
      set('alergias', [...form.alergias, trimmed])
    }
  }

  function removeAlergia(tag: string) {
    set('alergias', form.alergias.filter(a => a !== tag))
  }

  function handleAlergiasInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addAlergia(form.alergiasInput)
      set('alergiasInput', '')
    }
  }

  const stepTitles = [
    'Informações Básicas',
    'Dados Físicos',
    'Saúde',
    'Preferências',
  ]

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      {/* Header */}
      <div className="bg-amber-600 text-white px-6 pt-8 pb-4 flex-shrink-0">
        <h1 className="text-3xl font-bold mb-1">
          {isEditing ? 'Editar Perfil' : 'Criar Perfil'}
        </h1>
        <p className="text-lg text-amber-100">{stepTitles[step - 1]}</p>

        {/* Progress bar */}
        <div className="mt-4 flex gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                i + 1 <= step ? 'bg-white' : 'bg-amber-400'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-amber-100 mt-1">Passo {step} de {TOTAL_STEPS}</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-6 pb-32">
          {/* Error messages */}
          {errors.length > 0 && (
            <div className="mb-4 bg-red-100 border border-red-300 rounded-2xl p-4">
              {errors.map((e, i) => (
                <p key={i} className="text-lg text-red-700">{e}</p>
              ))}
            </div>
          )}

          {/* Step 1: Informações Básicas */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-amber-900 mb-2">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={e => set('nome', e.target.value)}
                  placeholder="Ex: Maria da Silva"
                  className="w-full rounded-2xl border-2 border-amber-300 bg-white px-4 py-3 text-lg text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-amber-900 mb-2">
                  Data de nascimento
                </label>
                <input
                  type="date"
                  value={form.dataNascimento}
                  onChange={e => set('dataNascimento', e.target.value)}
                  className="w-full rounded-2xl border-2 border-amber-300 bg-white px-4 py-3 text-lg text-gray-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-amber-900 mb-3">
                  Gênero
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {GENERO_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('genero', opt.value)}
                      className={`min-h-[56px] rounded-2xl border-2 px-4 py-3 text-lg font-medium transition-all ${
                        form.genero === opt.value
                          ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                          : 'border-amber-300 bg-white text-amber-900 hover:border-amber-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Dados Físicos */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-amber-900 mb-2">
                  Altura: <span className="text-amber-600">{form.alturaCm} cm</span>
                </label>
                <input
                  type="range"
                  min={130}
                  max={210}
                  value={form.alturaCm}
                  onChange={e => set('alturaCm', Number(e.target.value))}
                  className="w-full h-3 rounded-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-base text-amber-700 mt-1">
                  <span>130 cm</span>
                  <span>210 cm</span>
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-amber-900 mb-2">
                  Peso (opcional)
                </label>
                <input
                  type="number"
                  value={form.pesoKg}
                  onChange={e => set('pesoKg', e.target.value)}
                  placeholder="Ex: 70"
                  min={20}
                  max={300}
                  className="w-full rounded-2xl border-2 border-amber-300 bg-white px-4 py-3 text-lg text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:outline-none"
                />
                <p className="text-base text-amber-600 mt-1">Quilogramas (kg)</p>
              </div>

              <div>
                <label className="block text-lg font-semibold text-amber-900 mb-3">
                  Mobilidade
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {MOBILIDADE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('mobilidade', opt.value)}
                      className={`min-h-[56px] rounded-2xl border-2 px-5 py-4 text-lg font-medium text-left transition-all ${
                        form.mobilidade === opt.value
                          ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                          : 'border-amber-300 bg-white text-amber-900 hover:border-amber-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Saúde */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-amber-900 mb-3">
                  Sensibilidade da pele
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {PELE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('sensibilidadePele', opt.value)}
                      className={`min-h-[56px] rounded-2xl border-2 px-5 py-4 text-lg font-medium text-left transition-all ${
                        form.sensibilidadePele === opt.value
                          ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                          : 'border-amber-300 bg-white text-amber-900 hover:border-amber-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-amber-900 mb-3">
                  Sensibilidade térmica reduzida?
                </label>
                <p className="text-base text-amber-700 mb-3">
                  Dificuldade em sentir diferença de temperatura na água.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => set('sensibilidadeTermicaReduzida', true)}
                    className={`min-h-[56px] rounded-2xl border-2 px-4 py-3 text-lg font-medium transition-all ${
                      form.sensibilidadeTermicaReduzida === true
                        ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                        : 'border-amber-300 bg-white text-amber-900 hover:border-amber-400'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => set('sensibilidadeTermicaReduzida', false)}
                    className={`min-h-[56px] rounded-2xl border-2 px-4 py-3 text-lg font-medium transition-all ${
                      form.sensibilidadeTermicaReduzida === false
                        ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                        : 'border-amber-300 bg-white text-amber-900 hover:border-amber-400'
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-amber-900 mb-2">
                  Alergias / restrições (opcional)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={form.alergiasInput}
                    onChange={e => set('alergiasInput', e.target.value)}
                    onKeyDown={handleAlergiasInputKeyDown}
                    placeholder="Digite e pressione Enter"
                    className="flex-1 rounded-2xl border-2 border-amber-300 bg-white px-4 py-3 text-lg text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addAlergia(form.alergiasInput)
                      set('alergiasInput', '')
                    }}
                    className="min-h-[48px] px-5 rounded-2xl bg-amber-500 text-white text-lg font-semibold hover:bg-amber-600 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Quick tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {ALERGIA_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addAlergia(tag)}
                      disabled={form.alergias.includes(tag)}
                      className={`px-4 py-2 rounded-full border-2 text-base font-medium transition-all ${
                        form.alergias.includes(tag)
                          ? 'border-amber-300 bg-amber-100 text-amber-400 cursor-default'
                          : 'border-amber-400 bg-white text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                {/* Selected allergies */}
                {form.alergias.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.alergias.map(tag => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500 text-white text-base font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeAlergia(tag)}
                          className="ml-1 text-white hover:text-amber-200 font-bold leading-none"
                          aria-label={`Remover ${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Preferências */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-amber-900 mb-3">
                  Som preferido durante o banho
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {SOM_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('somPreferido', opt.value)}
                      className={`min-h-[56px] rounded-2xl border-2 px-5 py-4 text-lg font-medium text-left transition-all ${
                        form.somPreferido === opt.value
                          ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                          : 'border-amber-300 bg-white text-amber-900 hover:border-amber-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-amber-900 mb-3">
                  Contato de emergência (opcional)
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={form.contatoEmergenciaNome}
                    onChange={e => set('contatoEmergenciaNome', e.target.value)}
                    placeholder="Nome do contato"
                    className="w-full rounded-2xl border-2 border-amber-300 bg-white px-4 py-3 text-lg text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:outline-none"
                  />
                  <input
                    type="tel"
                    value={form.contatoEmergenciaTelefone}
                    onChange={e => set('contatoEmergenciaTelefone', e.target.value)}
                    placeholder="Telefone (ex: 11 99999-9999)"
                    className="w-full rounded-2xl border-2 border-amber-300 bg-white px-4 py-3 text-lg text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-amber-900 mb-2">
                  PIN do cuidador (opcional)
                </label>
                <p className="text-base text-amber-700 mb-3">
                  4 dígitos para acessar configurações avançadas.
                </p>
                <input
                  type="number"
                  value={form.pinCuidador}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                    set('pinCuidador', val)
                  }}
                  placeholder="0000"
                  maxLength={4}
                  className="w-full rounded-2xl border-2 border-amber-300 bg-white px-4 py-3 text-lg text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:outline-none tracking-widest"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-amber-200 px-6 py-4 flex gap-3 shadow-xl">
        {step > 1 && (
          <button
            type="button"
            onClick={handleVoltar}
            className="flex-1 min-h-[56px] rounded-2xl border-2 border-amber-400 bg-white text-amber-700 text-xl font-bold hover:bg-amber-50 transition-colors"
          >
            Voltar
          </button>
        )}
        <button
          type="button"
          onClick={handleAvancar}
          className="flex-1 min-h-[56px] rounded-2xl bg-amber-500 text-white text-xl font-bold hover:bg-amber-600 active:bg-amber-700 transition-colors shadow-md"
        >
          {step === TOTAL_STEPS ? 'Salvar' : 'Avançar'}
        </button>
      </div>
    </div>
  )
}
