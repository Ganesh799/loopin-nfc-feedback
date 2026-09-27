'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateBusinessImageAction } from './actions'

const MAX_BYTES = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export function ImageUploader({
  businessId,
  field,
  currentUrl,
  label,
}: {
  businessId: string
  field: 'logo_url' | 'cover_image_url'
  currentUrl: string | null
  label: string
}) {
  const supabase = createClient()
  const [preview, setPreview] = useState(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a PNG, JPEG, or WebP image.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be under 2MB.')
      return
    }

    setError(null)
    setUploading(true)

    const path = `${businessId}/${field}-${Date.now()}.${file.name.split('.').pop()}`

    const { error: uploadError } = await supabase.storage
      .from('business-assets')
      .upload(path, file, { upsert: true, cacheControl: '3600' })

    if (uploadError) {
      setUploading(false)
      setError(uploadError.message)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('business-assets').getPublicUrl(path)

    const result = await updateBusinessImageAction(field, publicUrl)
    setUploading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setPreview(publicUrl)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-2 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-slate-400">None</span>
          )}
        </div>
        <label className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          {uploading ? 'Uploading…' : 'Upload'}
          <input
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFile}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <p className="mt-1 text-xs text-slate-400">PNG, JPEG or WebP. Max 2MB.</p>
    </div>
  )
}
