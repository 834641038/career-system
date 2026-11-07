// 轻量登录态读取：直接从 localStorage 判断，不依赖 AuthProvider
'use client'

import { useEffect, useState } from 'react'

export interface CurrentUser {
  id?: string
  name?: string
  email?: string
  studentId?: string
}

export function useAuthState() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const readAuth = () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setUser(null)
        setChecked(true)
        return
      }
      let parsed: CurrentUser | null = null
      try {
        const raw = localStorage.getItem('user')
        if (raw) parsed = JSON.parse(raw)
      } catch {
        parsed = null
      }
      setUser(parsed || { name: localStorage.getItem('displayName') || '同学' })
      setChecked(true)
    }

    readAuth()
    // 让登录 / 退出后打开的其他标签页保持一致
    window.addEventListener('storage', readAuth)
    return () => window.removeEventListener('storage', readAuth)
  }, [])

  return { user, checked, isAuthenticated: !!user }
}
