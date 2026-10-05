import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Compass,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Sparkles,
  UserRound,
  UsersRound,
} from 'lucide-react'
import './access.css'

export function LoginScreen({ onEnter }: { onEnter: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (typeof document === 'undefined') return
    const previous = document.title
    document.title = 'Ingresar | Orientación vocacional'
    return () => {
      document.title = previous
    }
  }, [])
  return (
    <main className="ov-login theme-staff">
      <div className="ov-login-shell">
        <section className="ov-login-story" aria-label="Orientación vocacional">
          <div className="ov-login-brand">
            <span>
              <Compass size={25} aria-hidden="true" />
            </span>
            <div>
              Orientación<strong>Vocacional</strong>
            </div>
          </div>
          <div className="ov-login-story-copy">
            <p className="ov-login-kicker">
              <Sparkles size={15} aria-hidden="true" /> Cada paso cuenta
            </p>
            <h2>
              Tu futuro se construye <em>en compañía.</em>
            </h2>
            <p>
              Un camino para descubrir lo que te mueve, compartir tus preguntas y encontrar nuevas
              posibilidades.
            </p>
          </div>
          <div className="ov-login-compass" aria-hidden="true">
            <div className="ov-login-orbit" />
            <div className="ov-login-orbit ov-login-orbit-inner" />
            <svg className="ov-login-path" viewBox="0 0 440 250" fill="none">
              <path d="M68 174C105 218 146 211 211 126S315 26 377 76" />
              <path d="M211 126C267 187 302 191 346 198" />
            </svg>
            <span className="ov-login-central-seal">
              <Compass size={66} strokeWidth={1.25} />
            </span>
            <div className="ov-login-waypoint ov-login-waypoint-student">
              <span>
                <UserRound size={23} />
              </span>
              <strong>Descubre</strong>
            </div>
            <div className="ov-login-waypoint ov-login-waypoint-family">
              <span>
                <UsersRound size={23} />
              </span>
              <strong>Acompaña</strong>
            </div>
            <div className="ov-login-waypoint ov-login-waypoint-guide">
              <span>
                <GraduationCap size={23} />
              </span>
              <strong>Orienta</strong>
            </div>
          </div>
          <p className="ov-login-story-footer">
            Estudiantes, familias y orientadores.
            <br />
            <strong>Distintos roles, un mismo horizonte.</strong>
          </p>
        </section>
        <section className="ov-login-access" aria-labelledby="ov-login-title">
          <div className="ov-login-form-container">
            <span className="ov-login-welcome">Tu próximo paso empieza aquí</span>
            <h1 id="ov-login-title">Ingresa a la plataforma</h1>
            <p className="ov-login-description">
              Qué bueno tenerte aquí. Ingresa y elige el perfil que quieres explorar.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (username && password) onEnter()
              }}
            >
              <label htmlFor="ov-login-username">Usuario</label>
              <div className="ov-login-field">
                <UserRound size={19} aria-hidden="true" />
                <input
                  id="ov-login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Ingresa tu usuario"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
              <label htmlFor="ov-login-password">Contraseña</label>
              <div className="ov-login-field">
                <LockKeyhole size={19} aria-hidden="true" />
                <input
                  id="ov-login-password"
                  name="password"
                  type={visible ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  className="ov-login-visibility"
                  type="button"
                  aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={visible}
                  aria-controls="ov-login-password"
                  onClick={() => setVisible((current) => !current)}
                >
                  {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </div>
              <button type="submit" className="ov-login-submit">
                Ingresar <ArrowRight size={20} aria-hidden="true" />
              </button>
            </form>
            <div className="ov-login-demo">
              <span aria-hidden="true" />
              <p>
                <strong>Acceso de demostración</strong>Puedes usar cualquier usuario y contraseña.
              </p>
            </div>
            <p className="ov-login-shared">
              <span aria-hidden="true">
                <UserRound size={16} />
                <UsersRound size={16} />
                <GraduationCap size={16} />
              </span>
              Un mismo acceso para descubrir, acompañar y orientar.
            </p>
          </div>
          <p className="ov-login-footer">Orientación vocacional · Un futuro con posibilidades</p>
        </section>
      </div>
    </main>
  )
}
