import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    console.log('API Route: Testing Supabase connection...')
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5)

    if (error) {
      console.error('API Route: Supabase error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error, 
        message: 'Failed to fetch from Supabase' 
      }, { status: 500 })
    }

    console.log('API Route: Success, got', data?.length, 'records')
    
    return NextResponse.json({ 
      success: true, 
      count: data?.length || 0,
      data: data || [],
      message: 'Successfully fetched from Supabase'
    })
    
  } catch (error) {
    console.error('API Route: Exception:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Exception in API route' 
    }, { status: 500 })
  }
}
