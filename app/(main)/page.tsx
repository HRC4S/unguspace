'use client'

import { useEffect, useState, useCallback } from 'react'
import { PostCard } from '@/components/post/post-card'
import { PostComposer } from '@/components/post/post-composer'
import { Skeleton } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/api'

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/posts')
      setPosts(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  return (
    <div>
      <div className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur">
        <h1 className="text-xl font-bold">Beranda</h1>
      </div>

      <PostComposer onPosted={loadPosts} />

      {loading ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : posts.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">Belum ada postingan.</p>
      ) : (
        posts.map((post) => <PostCard key={post.id_post} post={post} />)
      )}
    </div>
  )
}