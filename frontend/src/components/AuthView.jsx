import React, { useState } from 'react';

export default function AuthView({ usuarios = [], ubicaciones = [], onLogin, onRegister, onShowToast }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Formulario de Registro
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFechaNac, setRegFechaNac] = useState('2000-01-01');
  const [regUbicacionId, setRegUbicacionId] = useState('');
  const [regBio, setRegBio] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      onShowToast('Por favor, ingresa tu correo electrónico', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // 1. Verificación de Administrador (acepta "admin", "admin@matchify.com", etc.)
      const isExplicitAdmin =
        cleanEmail === 'admin' ||
        cleanEmail === 'admin@matchify.com' ||
        cleanEmail.includes('admin');

      if (isExplicitAdmin) {
        onLogin({
          role: 'admin',
          nombre: 'Administrador',
          apellido: 'Matchify',
          email: cleanEmail.includes('@') ? cleanEmail : 'admin@matchify.com',
          user: {
            id: 0,
            nombre: 'Administrador',
            apellido: 'Matchify',
            email: 'admin@matchify.com',
            activo: true,
          },
        });
        setLoading(false);
        return;
      }

      // 2. Verificación de Usuario Normal existente en BD
      const existingUser = usuarios.find(
        (u) => u.email.toLowerCase() === cleanEmail
      );

      if (existingUser) {
        onLogin({
          role: 'user',
          user: existingUser,
        });
      } else {
        // Si no existe pero hay usuarios en BD, avisar
        if (usuarios.length > 0) {
          onShowToast(
            `No se encontró "${cleanEmail}". Puedes registrarte o seleccionar uno de los usuarios de prueba.`,
            'error'
          );
        } else {
          // Si la base de datos está vacía, crear sesión de usuario demo
          onLogin({
            role: 'user',
            user: {
              id: 1,
              nombre: cleanEmail.split('@')[0] || 'Usuario',
              apellido: 'Matchify',
              email: cleanEmail,
              biografia: 'Nuevo usuario en Matchify',
              activo: true,
            },
          });
        }
      }
      setLoading(false);
    }, 250);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regNombre.trim() || !regApellido.trim() || !regEmail.trim() || !regPassword.trim()) {
      onShowToast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    setLoading(true);
    try {
      const nuevoUsuario = await onRegister({
        nombre: regNombre.trim(),
        apellido: regApellido.trim(),
        email: regEmail.trim(),
        fechaNacimiento: new Date(regFechaNac).toISOString(),
        ubicacionId: regUbicacionId ? parseInt(regUbicacionId, 10) : null,
        biografia: regBio.trim(),
        activo: true,
      });

      onLogin({
        role: 'user',
        user: nuevoUsuario,
      });
    } catch (err) {
      onShowToast(err.message || 'Error al registrar usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLoginAdmin = (e) => {
    if (e) e.preventDefault();
    setEmail('admin@matchify.com');
    setPassword('admin123');
    onLogin({
      role: 'admin',
      nombre: 'Administrador',
      apellido: 'Matchify',
      email: 'admin@matchify.com',
      user: {
        id: 0,
        nombre: 'Administrador',
        apellido: 'Matchify',
        email: 'admin@matchify.com',
        activo: true,
      },
    });
  };

  const handleQuickLoginUser = (usuario) => {
    setEmail(usuario.email);
    setPassword('123456');
    onLogin({
      role: 'user',
      user: usuario,
    });
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">
        {/* Banner Superior con Logo */}
        <div className="auth-header">
          <div className="auth-logo-badge">🔥</div>
          <h1 className="auth-title">Matchify</h1>
          <p className="auth-subtitle">Conecta con personas afines a tus hobbies y pasiones</p>
        </div>

        {/* Selector de Pestañas: Login vs Registro */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${!isRegistering ? 'active' : ''}`}
            onClick={() => setIsRegistering(false)}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isRegistering ? 'active' : ''}`}
            onClick={() => setIsRegistering(true)}
          >
            Crear Cuenta
          </button>
        </div>

        {/* FORMULARIO: INICIAR SESIÓN */}
        {!isRegistering ? (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Correo Electrónico (o usuario)</label>
              <input
                id="login-email"
                type="text"
                className="form-control"
                placeholder="admin@matchify.com o tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>

            {/* Accesos Rápidos para Evaluación / Demo */}
            <div className="auth-demo-section">
              <span className="auth-demo-divider">Acceso Rápido Directo:</span>
              <div className="auth-demo-buttons">
                <button
                  type="button"
                  className="btn btn-admin-demo"
                  onClick={handleQuickLoginAdmin}
                >
                  🛡️ Ingresar como Administrador
                </button>

                {usuarios.length > 0 && (
                  <div className="quick-user-select-box">
                    <span className="quick-user-label">👤 Ingresar como Usuario:</span>
                    <div className="quick-user-chips">
                      {usuarios.slice(0, 5).map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          className="user-quick-chip"
                          onClick={() => handleQuickLoginUser(u)}
                          title={`Ingresar como ${u.nombre} ${u.apellido}`}
                        >
                          {u.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        ) : (
          /* FORMULARIO: REGISTRO DE NUEVO PERFIL */
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>
                  Nombre <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tu nombre"
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  Apellido <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tu apellido"
                  value={regApellido}
                  onChange={(e) => setRegApellido(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Correo Electrónico <span className="required-star">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="tu@correo.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Contraseña <span className="required-star">*</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Mínimo 6 caracteres"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input
                  type="date"
                  className="form-control"
                  value={regFechaNac}
                  onChange={(e) => setRegFechaNac(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Ubicación</label>
              <select
                className="form-control"
                value={regUbicacionId}
                onChange={(e) => setRegUbicacionId(e.target.value)}
              >
                <option value="">Selecciona tu ciudad...</option>
                {ubicaciones.map((ub) => (
                  <option key={ub.id} value={ub.id}>
                    {ub.ciudad}, {ub.provincia} ({ub.pais})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Biografía o Presentación</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Cuéntanos un poco sobre ti, tus intereses..."
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
                maxLength={300}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? 'Creando perfil...' : 'Registrarme e Ingresar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
