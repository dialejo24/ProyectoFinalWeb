import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchUserRole(uid) {
    const { data, error } = await supabase
      .from('users')
      .select('rol')
      .eq('uid', uid)
      .single()

    if (error) return null
    return data.rol
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const rol = await fetchUserRole(session.user.id)
        setUserRole(rol)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const rol = await fetchUserRole(session.user.id)
          setUserRole(rol)
        } else {
          setUserRole(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function register(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    const { error: profileError } = await supabase
      .from('users')
      .insert({
        uid: data.user.id,
        email,
        display_name: displayName,
        rol: 'usuario',
      })

    if (profileError) throw profileError
  }

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
