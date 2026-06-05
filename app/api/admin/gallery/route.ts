import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const id = (formData.get('id') as string) || null
    const title = (formData.get('title') as string) || ''
    const description = (formData.get('description') as string) || ''
    const category = (formData.get('category') as string) || ''

    const supabase = await createClient()

    // If no file and id provided, update metadata only
    if (!file && id) {
      const { data: updated, error: updateError } = await supabase
        .from('gallery')
        .update({ title, description: description || null, category: category || null })
        .eq('id', id)
        .select()

      if (updateError) {
        console.error('[v0] Error updating gallery record:', updateError)
        return NextResponse.json({ error: `Database error: ${updateError.message || JSON.stringify(updateError)}` }, { status: 500 })
      }

      return NextResponse.json(updated?.[0] || null, { status: 200 })
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Generate unique file name
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    const filePath = `gallery/${fileName}`

    // Convert file to buffer
    const buffer = await file.arrayBuffer()

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[v0] Error uploading file:', uploadError)
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message || JSON.stringify(uploadError)}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath)

    const imageUrl = publicUrlData.publicUrl

    if (id) {
      // Update existing record with new image url
      const { data: updated, error: updateError } = await supabase
        .from('gallery')
        .update({ title, description: description || null, image_url: imageUrl, category: category || null })
        .eq('id', id)
        .select()

      if (updateError) {
        console.error('[v0] Error updating gallery record:', updateError)
        // Cleanup uploaded file if database update fails
        await supabase.storage.from('gallery').remove([filePath])
        return NextResponse.json(
          { error: `Database error: ${updateError.message || JSON.stringify(updateError)}` },
          { status: 500 }
        )
      }

      return NextResponse.json(updated?.[0] || null, { status: 200 })
    }

    // Insert gallery record into database
    const { data: galleryData, error: dbError } = await supabase
      .from('gallery')
      .insert({
        title,
        description: description || null,
        image_url: imageUrl,
        category: category || null,
        is_active: true,
      })
      .select()

    if (dbError) {
      console.error('[v0] Error inserting gallery record:', dbError)
      // Cleanup uploaded file if database insert fails
      await supabase.storage.from('gallery').remove([filePath])
      return NextResponse.json(
        { error: `Database error: ${dbError.message || JSON.stringify(dbError)}` },
        { status: 500 }
      )
    }

    return NextResponse.json(galleryData[0], { status: 200 })
  } catch (error) {
    console.error('[v0] Error in gallery upload:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
