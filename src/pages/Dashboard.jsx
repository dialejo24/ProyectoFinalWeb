import { useAuth } from '../hooks/useAuth'
export default function Dashboard() {
  const { logout } = useAuth();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenido al dashboard. Aquí puedes ver tus reportes y estadísticas.</p>
      <button onClick={logout}>Salir</button>
    </div>
  )
}