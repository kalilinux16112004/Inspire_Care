import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Supabase service role key not configured')
  return createClient(url, serviceKey)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = getServiceClient()

    const { data, error } = await supabase.from('services').insert([body])

    if (error) {
      console.error("INSERT ERROR:", error);

      return NextResponse.json(
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, payload } = body
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const supabase = getServiceClient()
    const { data, error } = await supabase.from('services').update(payload).eq('id', id).select()

    if (error) return NextResponse.json({ error: error.message || error }, { status: 500 })

    return NextResponse.json({ data: data?.[0] || null }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const supabase = getServiceClient()
    const { data, error } = await supabase.from('services').delete().eq('id', id).select()

    if (error) return NextResponse.json({ error: error.message || error }, { status: 500 })

    return NextResponse.json({ data: data?.[0] || null }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
