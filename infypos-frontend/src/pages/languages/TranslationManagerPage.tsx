import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common'
import { HiOutlineArrowLeft, HiOutlineSearch, HiOutlineSave } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { languageApi } from '@/api'
import { TRANSLATION_SECTIONS, DEFAULT_TRANSLATION_KEYS, type TranslationSection } from '@/constants/translationKeys'

type Translations = Record<TranslationSection, Record<string, string>>

// Convert "nav.dashboard" → "Nav Dashboard"
const formatKey = (key: string) =>
  key.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

export default function TranslationManagerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [langName, setLangName]       = useState('')
  const [isoCode, setIsoCode]         = useState('')
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [activeTab, setActiveTab]     = useState<TranslationSection>('labels')
  const [search, setSearch]           = useState('')
  const [translations, setTranslations] = useState<Translations>({
    labels: {}, messages: {}, errors: {}, success: {},
  })

  useEffect(() => {
    if (!id) return
    languageApi.getTranslations(id).then(res => {
      const doc = res.data.data
      setLangName(doc.name)
      setIsoCode(doc.isoCode)
      setTranslations({
        labels:   doc.translations?.labels   || {},
        messages: doc.translations?.messages || {},
        errors:   doc.translations?.errors   || {},
        success:  doc.translations?.success  || {},
      })
    }).catch(() => toast.error('Failed to load translations'))
      .finally(() => setLoading(false))
  }, [id])

  // Merge default keys with saved values; default value is the English label as placeholder
  const currentKeys = useMemo(() => {
    const defaults = DEFAULT_TRANSLATION_KEYS[activeTab]
    return Object.entries(defaults).map(([key, defaultValue]) => ({
      key,
      label: formatKey(key),
      placeholder: defaultValue,
      value: translations[activeTab][key] ?? '',
    }))
  }, [activeTab, translations])

  const filtered = useMemo(() => {
    if (!search.trim()) return currentKeys
    const q = search.toLowerCase()
    return currentKeys.filter(item =>
      item.label.toLowerCase().includes(q) || item.placeholder.toLowerCase().includes(q)
    )
  }, [currentKeys, search])

  const handleChange = (key: string, value: string) => {
    setTranslations(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [key]: value },
    }))
  }

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    try {
      await languageApi.updateTranslations(id, activeTab, translations[activeTab])
      toast.success('Translations saved successfully')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading translations…</div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/languages')} className="btn-icon text-slate-500 hover:bg-slate-100">
            <HiOutlineArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="page-title">Translation Manager</h1>
            <p className="page-subtitle">
              <span className="font-medium text-slate-700">{langName}</span>
              <span className="ml-1.5 bg-slate-100 text-slate-500 font-mono text-[11px] px-1.5 py-0.5 rounded">{isoCode}</span>
            </p>
          </div>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <HiOutlineSave className="w-4 h-4" />
          Save Translations
        </Button>
      </div>

      <div className="card overflow-hidden">
        {/* Tabs + Search bar */}
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50 flex-wrap">
          {/* Tabs */}
          <div className="flex gap-1">
            {TRANSLATION_SECTIONS.map(sec => (
              <button
                key={sec.key}
                onClick={() => { setActiveTab(sec.key); setSearch('') }}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === sec.key
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec.label}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === sec.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {Object.keys(DEFAULT_TRANSLATION_KEYS[sec.key]).length}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-60">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search keys…"
              className="input pl-9 py-1.5 text-sm h-9"
            />
          </div>
        </div>

        {/* Translation grid */}
        <div className="p-5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No keys match your search</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(item => (
                <div key={item.key} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">
                    {item.label}:
                  </label>
                  <input
                    type="text"
                    value={item.value}
                    onChange={e => handleChange(item.key, e.target.value)}
                    placeholder={item.placeholder}
                    className="input text-sm py-1.5"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom save bar */}
        {filtered.length > 6 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
            <Button onClick={handleSave} loading={saving}>
              <HiOutlineSave className="w-4 h-4" />
              Save Translations
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
