import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data, error } = await supabase.from('tickets').select('*')

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Supabase Connection Test</h1>
      {error && <p className="text-red-500">Error: {error.message}</p>}
      {!error && <p className="text-green-600">Connected! Found {data?.length} tickets.</p>}
    </main>
  )
}