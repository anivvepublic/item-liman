import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({ balance: 0, username: 'Misafir' })
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (data) {
        setProfile(data)
      } else {
        setProfile({ balance: 0, username: null })
      }
    } catch (error) {
      console.log("Profil tablosu bağlantı hatası")
    }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile({ balance: 0, username: 'Misafir' })
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // BUNU EKLEDİK: Satın alma sonrası bakiyeyi güncelleme
  const refreshBalance = () => {
    if(user) fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshBalance }}>
      {children}
    </AuthContext.Provider>
  )
}