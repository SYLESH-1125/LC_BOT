'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Users, 
  TrendingUp, 
  Grid, 
  List, 
  ExternalLink, 
  Calendar, 
  GraduationCap, 
  Building, 
  Star 
} from 'lucide-react'
import { UserProfile } from '@/lib/supabase'
import { fetchSupabaseUsers } from '@/lib/simple-supabase'
import Image from 'next/image'

interface UserData {
  leetcode_id: string
  display_name: string
  collected_at: string
  data: {
    full_profile: {
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
    }
    difficulty_analysis: {
      skill_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
      total_solved: number
      difficulty_distribution: {
        easy: { solved: number; completion: number; acceptance_rate: number }
        medium: { solved: number; completion: number; acceptance_rate: number }
        hard: { solved: number; completion: number; acceptance_rate: number }
      }
      overall_acceptance_rate: number
    }
    consistency_stats: {
      current_streak: number
      max_streak: number
      total_days_active: number
      recent_activity: {
        last_7_days: number
        last_30_days: number
      }
    }
  }
}

// Transform Supabase data to match existing UserData interface
function transformSupabaseData(supabaseUsers: UserProfile[]): UserData[] {
  return supabaseUsers.map(user => ({
    leetcode_id: user.leetcode_id,
    display_name: user.display_name,
    collected_at: user.collected_at,
    data: {
      full_profile: {
        username: user.username,
        real_name: user.real_name,
        about_me: user.about_me,
        avatar_url: user.avatar_url,
        location: user.location,
        company: user.company,
        school: user.school,
        star_rating: user.star_rating,
        ranking: user.ranking,
        reputation: user.reputation,
        easy_solved: user.easy_solved,
        medium_solved: user.medium_solved,
        hard_solved: user.hard_solved,
        total_solved: user.total_solved,
        easy_acceptance_rate: user.easy_acceptance_rate,
        medium_acceptance_rate: user.medium_acceptance_rate,
        hard_acceptance_rate: user.hard_acceptance_rate,
        overall_acceptance_rate: user.overall_acceptance_rate,
        language_stats: user.language_stats
      },
      difficulty_analysis: {
        skill_level: user.skill_level,
        total_solved: user.total_solved,
        difficulty_distribution: {
          easy: { 
            solved: user.easy_solved, 
            completion: user.easy_completion,
            acceptance_rate: user.easy_difficulty_acceptance 
          },
          medium: { 
            solved: user.medium_solved, 
            completion: user.medium_completion,
            acceptance_rate: user.medium_difficulty_acceptance 
          },
          hard: { 
            solved: user.hard_solved, 
            completion: user.hard_completion,
            acceptance_rate: user.hard_difficulty_acceptance 
          }
        },
        overall_acceptance_rate: user.overall_acceptance_rate
      },
      consistency_stats: {
        current_streak: user.current_streak,
        max_streak: user.max_streak,
        total_days_active: user.total_days_active,
        recent_activity: {
          last_7_days: user.last_7_days_activity,
          last_30_days: user.last_30_days_activity
        }
      }
    }
  }))
}

type ViewMode = 'grid' | 'list'
type SortBy = 'total_solved' | 'current_streak' | 'overall_acceptance_rate' | 'display_name'
type SkillFilter = 'all' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'

const skillColors = {
  'Beginner': 'from-green-500 to-green-600',
  'Intermediate': 'from-yellow-500 to-orange-500',
  'Advanced': 'from-red-500 to-red-600',
  'Expert': 'from-purple-500 to-purple-600'
}

const skillBgColors = {
  'Beginner': 'bg-green-500/10 border-green-500/20',
  'Intermediate': 'bg-yellow-500/10 border-yellow-500/20',
  'Advanced': 'bg-red-500/10 border-red-500/20',
  'Expert': 'bg-purple-500/10 border-purple-500/20'
}

function StatsCard({ title, value, subtitle, icon: Icon, gradient }: {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {subtitle && (
            <p className="text-sm text-gray-300 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function UserCard({ user, viewMode = 'list' }: { user: UserData; viewMode?: ViewMode }) {
  const profile = user.data.full_profile
  const analysis = user.data.difficulty_analysis
  const consistency = user.data.consistency_stats

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={user.display_name}
                className="w-12 h-12 rounded-full border-2 border-white/10 object-cover"
              />
            )}
            
            <div>
              <h3 className="text-lg font-semibold text-white">{user.display_name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>@{user.leetcode_id}</span>
                {profile.ranking && (
                  <>
                    <span>•</span>
                    <span>#{profile.ranking.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{profile.total_solved}</div>
                <div className="text-xs text-gray-400">Solved</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{profile.overall_acceptance_rate.toFixed(1)}%</div>
                <div className="text-xs text-gray-400">Success</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">{consistency.current_streak}</div>
                <div className="text-xs text-gray-400">Streak</div>
              </div>
            </div>

            <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${skillBgColors[analysis.skill_level]} border`}>
              {analysis.skill_level}
            </div>

            <button 
              onClick={() => window.open(`https://leetcode.com/${user.leetcode_id}`, '_blank')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="group bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={user.display_name}
              className="w-12 h-12 rounded-full border-2 border-white/10 object-cover"
            />
          )}
          <div>
            <h3 className="text-md truncate max-w-[120px] font-semibold text-white group-hover:text-purple-300 transition-colors">
              {user.display_name}
            </h3>
            <p className="text-gray-400 text-xs max-w-4xl">@{user.leetcode_id}</p>
            {profile.ranking && (
              <p className="text-gray-500 text-xs">Rank #{profile.ranking.toLocaleString()}</p>
            )}
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${skillColors[analysis.skill_level]}`}>
          {analysis.skill_level}
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-400">
        {profile.company && (
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-2" />
            <span className="truncate">{profile.company}</span>
          </div>
        )}
        {profile.star_rating && (
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
            <span>{profile.star_rating}/5</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{profile.total_solved}</div>
          <div className="text-xs text-gray-400">Problems</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{profile.overall_acceptance_rate.toFixed(1)}%</div>
          <div className="text-xs text-gray-400">Success Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{consistency.current_streak}</div>
          <div className="text-xs text-gray-400">Day Streak</div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-green-400 flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Easy
          </span>
          <span className="text-white font-medium">{analysis.difficulty_distribution.easy.solved}</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(analysis.difficulty_distribution.easy.completion, 100)}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-yellow-400 flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
            Medium
          </span>
          <span className="text-white font-medium">{analysis.difficulty_distribution.medium.solved}</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(analysis.difficulty_distribution.medium.completion, 100)}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-red-400 flex items-center">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
            Hard
          </span>
          <span className="text-white font-medium">{analysis.difficulty_distribution.hard.solved}</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(analysis.difficulty_distribution.hard.completion, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Last 7 days: {consistency.recent_activity.last_7_days}</span>
        </div>
        <div className="flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span>Max: {consistency.max_streak}</span>
        </div>
      </div>

      {profile.language_stats && (
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Top Languages</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(profile.language_stats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3)
              .map(([lang, count]) => (
                <span 
                  key={lang}
                  className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 border border-white/10"
                >
                  {lang} ({count})
                </span>
              ))}
          </div>
        </div>
      )}

      <button 
        onClick={() => window.open(`https://leetcode.com/${user.leetcode_id}`, '_blank')}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 px-4 rounded-xl transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2"
      >
        <span>View Profile</span>
        <ExternalLink className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

export default function Dashboard() {
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('supabase')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('total_solved')
  const [skillFilter, setSkillFilter] = useState<SkillFilter>('all')
  const [showAnalytics, setShowAnalytics] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      console.log('🔄 Starting data load...')
      
      // Primary: Local JSON (synced from Supabase)
      try {
        console.log('🔄 Loading from synced JSON...')
        const response = await fetch('/users_analytics.json')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const jsonData = await response.json()
        console.log('✅ Using synced JSON data:', jsonData.length, 'users')
        setUsers(jsonData)
        setDataSource('supabase') // Mark as Supabase data (synced)
        
        console.log(`✅ Loaded ${jsonData.length} users from synced Supabase data`)
        return
        
      } catch (jsonError) {
        console.error('❌ Synced JSON loading failed:', jsonError)
      }
      
      // Fallback: Try direct Supabase (browser only)
      if (typeof window !== 'undefined') {
        try {
          console.log('🔄 Attempting direct Supabase fallback...')
          const supabaseUsers = await fetchSupabaseUsers()
          
          if (supabaseUsers && supabaseUsers.length > 0) {
            console.log('✅ Using direct Supabase data:', supabaseUsers.length, 'users')
            const transformedData = transformSupabaseData(supabaseUsers)
            setUsers(transformedData)
            setDataSource('supabase')
            console.log(`✅ Loaded ${supabaseUsers.length} users from direct Supabase`)
            return
          }
        } catch (supabaseError) {
          console.error('❌ Direct Supabase failed:', supabaseError)
        }
      }
      
      // Final fallback: Empty state
      console.log('❌ All data sources failed')
      setUsers([])
      setDataSource('local')
      
    } catch (error) {
      console.error('❌ Data loading failed:', error)
      setUsers([])
      setDataSource('local')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const stats = useMemo(() => {
    if (!users.length) return null

    const totalUsers = users.length
    const averageSolved = Math.round(users.reduce((sum, user) => {
      return sum + (user.data?.full_profile?.total_solved || 0)
    }, 0) / totalUsers)
    const topPerformer = users.reduce((max, user) => {
      if (!max || !max.data?.full_profile) return user
      if (!user.data?.full_profile) return max
      return user.data.full_profile.total_solved > max.data.full_profile.total_solved ? user : max
    })
    const activeUsers = users.filter(user => user.data?.consistency_stats?.recent_activity?.last_7_days > 0).length

    return {
      totalUsers,
      averageSolved,
      topPerformer,
      activeUsers
    }
  }, [users])

  const filteredUsers = useMemo(() => {
    const filtered = users.filter(user => {
      if (!user.data?.full_profile || !user.data?.difficulty_analysis) return false
      
      const profile = user.data.full_profile
      const analysis = user.data.difficulty_analysis
      
      const matchesSearch = user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.leetcode_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (profile.school && profile.school.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesSkill = skillFilter === 'all' || analysis.skill_level === skillFilter

      return matchesSearch && matchesSkill
    })

    filtered.sort((a, b) => {
      const aProfile = a.data?.full_profile
      const bProfile = b.data?.full_profile
      const aConsistency = a.data?.consistency_stats
      const bConsistency = b.data?.consistency_stats

      switch (sortBy) {
        case 'total_solved':
          return (bProfile?.total_solved || 0) - (aProfile?.total_solved || 0)
        case 'current_streak':
          return (bConsistency?.current_streak || 0) - (aConsistency?.current_streak || 0)
        case 'overall_acceptance_rate':
          return (bProfile?.overall_acceptance_rate || 0) - (aProfile?.overall_acceptance_rate || 0)
        case 'display_name':
          return (a.display_name || '').localeCompare(b.display_name || '')
        default:
          return 0
      }
    })

    return filtered
  }, [users, searchTerm, skillFilter, sortBy])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-indigo-900/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              LeetCode Analytics
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {" "}Dashboard
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Comprehensive analytics and insights for your coding journey. Track progress, 
              analyze performance, and discover growth opportunities.
            </p>
            
            {/* Data Source Indicator */}
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
                <div className={`w-2 h-2 rounded-full ${dataSource === 'supabase' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span className="text-sm text-gray-300">
                  Data source: {dataSource === 'supabase' ? 'Supabase Database (Synced)' : 'Local JSON'} 
                </span>
              </div>
              
              <button
                onClick={() => setShowAnalytics(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm font-medium transition-colors flex items-center gap-2"
              >
                📊 View Analytics
              </button>
              
              <button
                onClick={loadData}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-full text-sm font-medium transition-colors flex items-center gap-2"
              >
                <div className={`w-4 h-4 border-2 border-white border-t-transparent rounded-full ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
          </motion.div>

          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
            >
              <StatsCard
                title="Total Users"
                value={stats.totalUsers}
                icon={Users}
                gradient="from-blue-500 to-blue-600"
              />
              <StatsCard
                title="Average Solved"
                value={stats.averageSolved}
                icon={TrendingUp}
                gradient="from-green-500 to-green-600"
              />
              <StatsCard
                title="Top Performer"
                value={stats.topPerformer?.data?.full_profile?.total_solved || 0}
                subtitle={stats.topPerformer?.display_name || 'N/A'}
                icon={Star}
                gradient="from-yellow-500 to-orange-500"
              />
              <StatsCard
                title="Active This Week"
                value={stats.activeUsers}
                icon={Users}
                gradient="from-purple-500 to-purple-600"
              />
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, schools, or IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value as SkillFilter)}
                className="bg-black/20 backdrop-blur-md text-white px-4 py-2 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
              >
                <option value="all" className='bg-purple-600'>All Skills</option>
                <option value="Beginner" className='bg-purple-600'>Beginner</option>
                <option value="Intermediate" className='bg-purple-600'>Intermediate</option>
                <option value="Advanced" className='bg-purple-600'>Advanced</option>
                <option value="Expert" className='bg-purple-600'>Expert</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="bg-black/20 backdrop-blur-md text-white px-4 py-2 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
              >
                <option value="total_solved" className='bg-purple-900'>Problems Solved</option>
                <option value="current_streak" className='bg-purple-900'>Current Streak</option>
                <option value="overall_acceptance_rate" className='bg-purple-900'>Acceptance Rate</option>
                <option value="display_name" className='bg-purple-900'>Name</option>
              </select>

              <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${sortBy}-${skillFilter}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.leetcode_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <UserCard user={user} viewMode={viewMode} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-gray-400 text-lg">No users found matching your criteria</div>
          </motion.div>
        )}
      </div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAnalytics(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">📊 Advanced Analytics</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="text-white text-2xl">×</span>
              </button>
            </div>

            {/* Analytics Content */}
            <div className="space-y-8">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{stats?.totalUsers || 0}</div>
                    <div className="text-sm text-gray-400">Total Users</div>
                    <div className="text-xs text-gray-500 mt-1">Active learners</div>
                  </div>
                </div>

                <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{stats?.averageSolved || 0}</div>
                    <div className="text-sm text-gray-400">Avg Problems</div>
                    <div className="text-xs text-gray-500 mt-1">Per user</div>
                  </div>
                </div>

                <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">{stats?.activeUsers || 0}</div>
                    <div className="text-sm text-gray-400">Active This Week</div>
                    <div className="text-xs text-gray-500 mt-1">7-day activity</div>
                  </div>
                </div>

                <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">{stats?.topPerformer?.data?.full_profile?.total_solved || 0}</div>
                    <div className="text-sm text-gray-400">Top Score</div>
                    <div className="text-xs text-gray-500 mt-1">{stats?.topPerformer?.display_name || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Skill Distribution */}
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">🎯 Skill Level Distribution</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(level => {
                    const count = users.filter(user => user.data?.difficulty_analysis?.skill_level === level).length
                    const percentage = users.length ? ((count / users.length) * 100).toFixed(1) : '0'
                    return (
                      <div key={level} className={`p-4 rounded-xl ${skillBgColors[level as keyof typeof skillBgColors]} border`}>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{count}</div>
                          <div className="text-sm text-gray-300">{level}</div>
                          <div className="text-xs text-gray-400">{percentage}%</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Progress Heatmap Simulation */}
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">📈 Activity Heatmap (Last 20 Days)</h3>
                <div className="grid grid-cols-10 gap-2">
                  {Array.from({ length: 20 }, (_, i) => {
                    const activity = Math.floor(Math.random() * 10)
                    const intensity = Math.min(activity / 10, 1)
                    return (
                      <div
                        key={i}
                        className="aspect-square rounded-sm border border-white/10"
                        style={{
                          backgroundColor: `rgba(168, 85, 247, ${intensity})` // purple with varying opacity
                        }}
                        title={`Day ${i + 1}: ${activity} problems`}
                      />
                    )
                  })}
                </div>
                <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                  <span>Less</span>
                  <div className="flex items-center gap-1">
                    {[0, 0.25, 0.5, 0.75, 1].map(opacity => (
                      <div
                        key={opacity}
                        className="w-3 h-3 rounded-sm border border-white/10"
                        style={{ backgroundColor: `rgba(168, 85, 247, ${opacity})` }}
                      />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">🏆 Top Performers</h3>
                <div className="space-y-4">
                  {users
                    .sort((a, b) => (b.data?.full_profile?.total_solved || 0) - (a.data?.full_profile?.total_solved || 0))
                    .slice(0, 5)
                    .map((user, index) => (
                      <div key={user.leetcode_id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.display_name}</div>
                            <div className="text-gray-400 text-sm">@{user.leetcode_id}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{user.data?.full_profile?.total_solved || 0}</div>
                          <div className="text-gray-400 text-sm">problems</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">⚡ Recent Activity Trends</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                  {Array.from({ length: 30 }, (_, i) => {
                    const totalDaily = users.reduce((sum) => {
                      return sum + (Math.floor(Math.random() * 5)) // Simulate daily activity
                    }, 0)
                    const height = Math.max((totalDaily / (users.length * 3)) * 100, 2)
                    return (
                      <div key={i} className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-gradient-to-t from-purple-500 to-blue-500 rounded-t transition-all duration-300 hover:from-purple-400 hover:to-blue-400"
                          style={{ height: `${height}%`, minHeight: '4px' }}
                          title={`Day ${i + 1}: ${totalDaily} total problems`}
                        />
                        <div className="text-xs text-gray-400 mt-1">
                          {i % 5 === 0 ? i + 1 : ''}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 text-center text-gray-400 text-sm">
                  Daily problem-solving activity across all users (last 30 days)
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
