// components/dashboard/TablePosts.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'

type Post = {
  id: string
  title: string
  slug: string
  published_at: string | null
  is_draft: boolean
  // Supabase vrne categories kot array z enim elementom
  categories: { slug: string; name: string }[]
}

export default function TablePosts({ data }: { data: Post[] }) {
  const supabase = createClient()
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  // Pretvorimo is_draft iz morebitno null v boolean; categories obdržimo kot array
  const [posts, setPosts] = useState<Post[]>(() =>
    data.map(post => ({
      ...post,
      is_draft: post.is_draft === null ? true : post.is_draft,
    }))
  )

  useEffect(() => {
    const channel = supabase
      .channel('realtime-posts')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        () => {
          fetchLatestPosts()
          toast.success('Post osvežen!')
        }
      )
      .subscribe()
    return () => void supabase.removeChannel(channel)
  }, [])

  const fetchLatestPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, published_at, is_draft, categories(name, slug)')
    if (!error && data) {
      setPosts(
        data.map(post => ({
          ...post,
          is_draft: post.is_draft === null ? true : post.is_draft,
        }))
      )
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) return void toast.error('Greška pri brisanju')
    toast.success('Post izbrisan')
    setPosts(p => p.filter(r => r.id !== id))
  }

  // Zberemo unikatne imena iz prve (in edine) kategorije vsakega posta
  const uniqueCategories = Array.from(
    new Set(
      data
        .map(p => p.categories[0]?.name)
        .filter((n): n is string => Boolean(n))
    )
  )

  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: 'title',
      header: 'Naslov',
      cell: ({ row }) => (
        <Link
          href={`/dashboard/posts/${row.original.slug}/view`}
          className="text-primary hover:underline"
        >
          {row.original.title}
        </Link>
      ),
    },
    {
      id: 'category',
      header: 'Kategorija',
      accessorFn: row => row.categories[0]?.name ?? '—',
      cell: ({ row }) => row.original.categories[0]?.name ?? '—',
      sortingFn: (a, b) =>
        (a.original.categories[0]?.name ?? '').localeCompare(
          b.original.categories[0]?.name ?? ''
        ),
    },
    {
      accessorKey: 'is_draft',
      header: 'Draft',
      cell: ({ getValue }) =>
        getValue<boolean>() ? '✅' : '❌',
      sortingFn: (a, b) => {
        const aD = a.getValue<boolean>('is_draft')
        const bD = b.getValue<boolean>('is_draft')
        return aD === bD ? 0 : aD ? -1 : 1
      },
    },
    {
      header: 'Objavljeno',
      accessorKey: 'published_at',
      cell: ({ getValue }) =>
        getValue<string | null>()
          ? new Date(getValue<string>()).toLocaleString('sl-SI', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '—',
      sortingFn: (a, b) => {
        const aT = new Date(a.getValue<string | null>('published_at') || 0).getTime()
        const bT = new Date(b.getValue<string | null>('published_at') || 0).getTime()
        return bT - aT
      },
    },
    {
      header: 'Actions',
      cell: ({ row }) => {
        const id = row.original.id
        return (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => router.push(`/dashboard/posts/${row.original.slug}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" className="text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Obrisati post?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Prekliči</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(id)}>
                    Izbriši
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: posts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { sorting: [{ id: 'published_at', desc: true }] },
  })

  // Najprej filtriramo po search in category
  const filtered = table
    .getRowModel()
    .rows.filter(r => {
      const title = r.original.title.toLowerCase()
      const slug = r.original.slug.toLowerCase()
      const cat = r.original.categories[0]?.name.toLowerCase() ?? ''
      const okSearch = title.includes(search.toLowerCase()) || slug.includes(search.toLowerCase())
      const okCat = categoryFilter === 'all' || cat === categoryFilter
      return okSearch && okCat
    })

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <Input
          placeholder="Pretraži po naslovu"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-80"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter po kategoriji" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Vse kategorije</SelectItem>
            {uniqueCategories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Link href="/dashboard/posts/new">
          <Button>Dodaj Post</Button>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className="cursor-pointer px-4 py-2 text-left"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{
                      asc: ' ↑',
                      desc: ' ↓',
                    }[h.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t">
                {r.getVisibleCells().map(c => (
                  <td key={c.id} className="px-2 py-1">
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
