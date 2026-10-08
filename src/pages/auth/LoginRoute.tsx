import { Navigate, useNavigate } from 'react-router'
import { LoginScreen } from '@/features/auth/components/LoginScreen'
import { useDemoAccess, startDemoAccess } from '@/features/auth/lib/demoAccess'
import { appPaths } from '@/routes/paths'
import { modoApi } from '@/config/env'
import { guardarUsuarioIngreso } from '@/store/servidor/cuenta'
import { prepararIngreso } from '@/store/servidor/operaciones'

function LoginRoute() {
  const navigate = useNavigate()
  const active = useDemoAccess()
  if (active) return <Navigate replace to={appPaths.roleSelection} />
  return (
    <LoginScreen
      onEnter={(usuario) => {
        if (modoApi) {
          guardarUsuarioIngreso(usuario)
          prepararIngreso()
        }
        startDemoAccess()
        navigate(appPaths.roleSelection, { replace: true })
      }}
    />
  )
}

export { LoginRoute }
