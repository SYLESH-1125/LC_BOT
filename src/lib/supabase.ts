import { createClient } from '@supabase/supabase-js'

// Ensure this only runs in browser environment
const supabaseUrl = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL! : ''
const supabaseAnonKey = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! : ''

export const supabase = typeof window !== 'undefined' ? createClient(supabaseUrl, supabaseAnonKey) : null

// Database types
export interface UserProfile {
  id: string
  leetcode_id: string
  display_name: string
  collected_at: string
  username: string
  real_name?: string
  about_me?: string
  avatar_url?: string
  location?: string
  company?: string
  school?: string
  star_rating?: number
  ranking?: number
  reputation: number
  easy_solved: number
  medium_solved: number
  hard_solved: number
  total_solved: number
  easy_acceptance_rate: number
  medium_acceptance_rate: number
  hard_acceptance_rate: number
  overall_acceptance_rate: number
  language_stats?: Record<string, number>
  skill_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  current_streak: number
  max_streak: number
  total_days_active: number
  last_7_days_activity: number
  last_30_days_activity: number
  easy_completion: number
  medium_completion: number
  hard_completion: number
  easy_difficulty_acceptance: number
  medium_difficulty_acceptance: number
  hard_difficulty_acceptance: number
}

// Helper functions to fetch data
export async function fetchAllUsers() {
  try {
    console.log('🔄 Supabase fetchAllUsers: Starting fetch...')
    
    if (!supabase) {
      throw new Error('Supabase client not available (server-side rendering)')
    }
    
    console.log('🔄 Supabase URL:', typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : 'SSR')
    console.log('🔄 Supabase Key length:', typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length : 'SSR')
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      // Remove the problematic ordering - we'll sort in the frontend
      // .order('total_solved', { ascending: false })

    console.log('📊 Supabase fetchAllUsers: Raw response:', { 
      hasData: !!data, 
      dataLength: data?.length || 0, 
      hasError: !!error,
      errorDetails: error ? JSON.stringify(error) : 'none',
      sampleData: data?.[0] ? `${data[0].leetcode_id} - ${data[0].display_name}` : 'none'
    })

    if (error) {
      console.error('❌ Supabase fetchAllUsers: Error object:', error)
      console.error('❌ Supabase fetchAllUsers: Error details:', JSON.stringify(error, null, 2))
      throw new Error(`Supabase error: ${JSON.stringify(error)}`)
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ Supabase fetchAllUsers: No data returned')
      throw new Error('No data returned from Supabase')
    }

    console.log('✅ Supabase fetchAllUsers: Successfully fetched', data.length, 'users')
    console.log('✅ First user sample:', data[0]?.leetcode_id, data[0]?.display_name, data[0]?.total_solved)
    return data
  } catch (err) {
    console.error('❌ Supabase fetchAllUsers: Exception caught:', err)
    console.error('❌ Exception type:', typeof err, err instanceof Error ? err.constructor.name : 'Unknown')
    throw err
  }
}

export async function fetchUserByLeetcodeId(leetcodeId: string) {
  if (!supabase) {
    throw new Error('Supabase client not available (server-side rendering)')
  }
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('leetcode_id', leetcodeId)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    throw error
  }

  return data
}

export async function searchUsers(searchTerm: string) {
  if (!supabase) {
    throw new Error('Supabase client not available (server-side rendering)')
  }
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .or(`display_name.ilike.%${searchTerm}%,leetcode_id.ilike.%${searchTerm}%,school.ilike.%${searchTerm}%`)
    .order('total_solved', { ascending: false })

  if (error) {
    console.error('Error searching users:', error)
    throw error
  }

  return data
}

export async function filterUsersBySkillLevel(skillLevel: string) {
  if (skillLevel === 'all') {
    return fetchAllUsers()
  }

  if (!supabase) {
    throw new Error('Supabase client not available (server-side rendering)')
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('skill_level', skillLevel)
    .order('total_solved', { ascending: false })

  if (error) {
    console.error('Error filtering users:', error)
    throw error
  }

  return data
}
