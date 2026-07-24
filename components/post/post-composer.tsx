'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { apiFetch } from '@/lib/api'

export function PostComposer({ onPosted }: { onPosted: () => void }) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const handleSubmit = async () => {
    if (!text.trim() && !file) return
    setLoading(true)

    try {
      let media_url = null
      let media_type = null

      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const uploaded = await res.json()
        media_url = uploaded.media_url
        media_type = uploaded.media_type
      }

      await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          konten_teks: text,
          media_url,
          media_type,
          visibility: 'public',
        }),
      })

      setText('')
      setFile(null)
      onPosted()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-3 border-b p-4">
      <Avatar>
        <AvatarImage src={user.avatar_url || undefined} />
        <AvatarFallback>{user.nama_lengkap[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <Textarea
          placeholder="Apa yang terjadi?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-20 resize-none border-none text-lg shadow-none focus-visible:ring-0"
        />

        {file && (
          <p className="mb-2 text-sm text-muted-foreground">📎 {file.name}</p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <label className="cursor-pointer text-primary">
            <ImageIcon className="h-5 w-5" />
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <Button onClick={handleSubmit} disabled={loading} className="rounded-full">
            {loading ? 'Memposting...' : 'Posting'}
          </Button>
        </div>
      </div>
    </div>
  )
}