import { createContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchUserRole(uid) {
    try {
      const result = await Promise.race([
        supabase.from('users').select('rol').eq('uid', uid).maybeSingle(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ])
      const { data, error } = result
      if (error || !data) return 'usuario'
      return data.rol
    } catch {
      return 'usuario'
    }
  }

  useEffect(() => {
    supabase.auth.getClaims().then(({ data }) => {
      const claims = data?.claims
      if (claims) {
        setUser({ id: claims.sub, email: claims.email })
        setLoading(false)
        fetchUserRole(claims.sub).then(setUserRole)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getClaims().then(({ data }) => {
        const claims = data?.claims
        if (claims) {
          setUser({ id: claims.sub, email: claims.email })
          fetchUserRole(claims.sub).then(setUserRole)
        } else {
          setUser(null)
          setUserRole(null)
        }
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  async function register(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    })

    if (error) throw new Error('No se pudo crear la cuenta.')
    if (!data.user) throw new Error('No se pudo obtener el usuario.')

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) throw new Error('Cuenta creada. Inicia sesión manualmente.')
  }

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error('Correo o contraseña incorrectos.')
  }

  async function logout() {
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ])
    } catch (err) {
      console.warn('SignOut timeout, forzando logout local:', err.message)
    } finally {
      setUser(null)
      setUserRole(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}