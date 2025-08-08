'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ProgressData {
  date: string
  problems_solved: number
  easy_solved: number
  medium_solved: number
  hard_solved: number
  time_spent_minutes: number
  submissions: number
  accepted_submissions: number
  topics_practiced: string[]
  difficulty_focus: string
  streaks_active: boolean
}

interface SkillProfile {
  user_id: string
  username: string
  overall_level: string
  strengths: string[]
  weaknesses: string[]
  learning_velocity: number
  consistency_rating: number
  difficulty_preference: string
  recommended_focus: string[]
  estimated_contest_rating: number
  skill_progression: Record<string, number>
}

export default function AnalyticsPage() {
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [skillProfile, setSkillProfile] = useState<SkillProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDays, setSelectedDays] = useState(30)

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedDays,])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch from your API
      // For now, we'll simulate some data
      const mockProgressData: ProgressData[] = Array.from({ length: selectedDays }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return {
          date: date.toISOString().split('T')[0],
          problems_solved: Math.floor(Math.random() * 8),
          easy_solved: Math.floor(Math.random() * 3),
          medium_solved: Math.floor(Math.random() * 4),
          hard_solved: Math.floor(Math.random() * 2),
          time_spent_minutes: Math.floor(Math.random() * 180),
          submissions: Math.floor(Math.random() * 15),
          accepted_submissions: Math.floor(Math.random() * 10),
          topics_practiced: ['Array', 'Dynamic Programming', 'Tree'].slice(0, Math.floor(Math.random() * 3) + 1),
          difficulty_focus: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
          streaks_active: Math.random() > 0.5
        }
      }).reverse()

      const mockSkillProfile: SkillProfile = {
        user_id: '1',
        username: 'sample_user',
        overall_level: 'Intermediate',
        strengths: ['Dynamic Programming', 'Graph Theory', 'Greedy Algorithms'],
        weaknesses: ['Tree Traversal', 'Binary Search'],
        learning_velocity: 12.5,
        consistency_rating: 75.5,
        difficulty_preference: 'medium',
        recommended_focus: ['Practice more hard problems', 'Improve daily consistency'],
        estimated_contest_rating: 1450,
        skill_progression: {
          'Arrays': 85,
          'Dynamic Programming': 78,
          'Graphs': 65,
          'Trees': 45
        }
      }

      setProgressData(mockProgressData)
      setSkillProfile(mockSkillProfile)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = () => {
    if (!progressData.length) return null

    const totalProblems = progressData.reduce((sum, day) => sum + day.problems_solved, 0)
    const avgProblems = totalProblems / progressData.length
    const activeDays = progressData.filter(day => day.problems_solved > 0).length
    const consistency = (activeDays / progressData.length) * 100

    const easyTotal = progressData.reduce((sum, day) => sum + day.easy_solved, 0)
    const mediumTotal = progressData.reduce((sum, day) => sum + day.medium_solved, 0)
    const hardTotal = progressData.reduce((sum, day) => sum + day.hard_solved, 0)

    return {
      totalProblems,
      avgProblems,
      activeDays,
      consistency,
      easyTotal,
      mediumTotal,
      hardTotal
    }
  }

  const stats = calculateStats()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics....</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            📊 LeetCode Progress Analytics
          </h1>
          <p className="text-gray-300 text-lg">
            Comprehensive analysis of your coding journey
          </p>
        </div>

        {/* Navigation */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Time Period Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            {[7, 14, 30, 60, 90].map(days => (
              <Button
                key={days}
                onClick={() => setSelectedDays(days)}
                variant={selectedDays === days ? "default" : "outline"}
                className="text-white border-white/20"
              >
                {days} days
              </Button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Problems</CardTitle>
                <div className="text-green-400">🎯</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalProblems}</div>
                <p className="text-xs text-gray-400">
                  {stats.avgProblems.toFixed(1)} per day average
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Active Days</CardTitle>
                <div className="text-blue-400">📅</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.activeDays}/{progressData.length}
                </div>
                <p className="text-xs text-gray-400">
                  {stats.consistency.toFixed(1)}% consistency
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Difficulty Split</CardTitle>
                <div className="text-purple-400">📊</div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-white space-y-1">
                  <div className="flex justify-between">
                    <span className="text-green-400">Easy:</span>
                    <span>{stats.easyTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-400">Medium:</span>
                    <span>{stats.mediumTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">Hard:</span>
                    <span>{stats.hardTotal}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {skillProfile && (
              <Card className="bg-black/20 backdrop-blur-md border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Skill Level</CardTitle>
                  <div className="text-yellow-400">🏆</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{skillProfile.overall_level}</div>
                  <p className="text-xs text-gray-400">
                    Rating: {skillProfile.estimated_contest_rating}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Skill Profile */}
        {skillProfile && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  📈 Skill Assessment
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Your current programming strengths and areas for improvement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-green-400 font-medium mb-2">💪 Strengths</h4>
                  <div className="space-y-1">
                    {skillProfile.strengths.map((strength, index) => (
                      <div key={index} className="text-sm text-gray-300">
                        • {strength}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-yellow-400 font-medium mb-2">🎯 Recommended Focus</h4>
                  <div className="space-y-1">
                    {skillProfile.recommended_focus.map((focus, index) => (
                      <div key={index} className="text-sm text-gray-300">
                        • {focus}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-gray-300">Learning Velocity:</span>
                  <span className="text-white font-medium">
                    {skillProfile.learning_velocity} problems/week
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Consistency Rating:</span>
                  <span className="text-white font-medium">
                    {skillProfile.consistency_rating.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  ⏱️ Progress Breakdown
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Topic-wise skill progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(skillProfile.skill_progression).map(([topic, progress]) => (
                    <div key={topic}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{topic}</span>
                        <span className="text-white">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity Chart */}
        <Card className="bg-black/20 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity Pattern</CardTitle>
            <CardDescription className="text-gray-300">
              Daily problem solving over the last {selectedDays} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-1">
              {progressData.slice(-20).map((day, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-blue-500 rounded-t transition-all duration-300 hover:from-purple-400 hover:to-blue-400"
                    style={{
                      height: `${Math.max((day.problems_solved / 10) * 100, 2)}%`,
                      minHeight: day.problems_solved > 0 ? '8px' : '2px'
                    }}
                    title={`${day.date}: ${day.problems_solved} problems`}
                  />
                  <div className="text-xs text-gray-400 mt-1 rotate-45 origin-left">
                    {new Date(day.date).getDate()}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-gray-400 text-sm">
              Hover over bars to see daily details
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
