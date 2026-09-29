import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { api } from './services/api';

// Auth Screen
import AuthView from './components/AuthView';

// Navigation & Global UI
import Sidebar from './components/Sidebar';
import NavbarMobile from './components/NavbarMobile';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import ReportModal from './components/ReportModal';

// Admin Components & Modals
import StatsGrid from './components/AdminView/StatsGrid';
import DevResetPanel from './components/AdminView/DevResetPanel';
import UsuariosTab from './components/AdminView/UsuariosTab';
import HobbiesTab from './components/AdminView/HobbiesTab';
import UbicacionesTab from './components/AdminView/UbicacionesTab';
import UsuarioModal from './components/AdminView/UsuarioModal';
import HobbieModal from './components/AdminView/HobbieModal';
import UbicacionModal from './components/AdminView/UbicacionModal';
import DeleteConfirmModal from './components/AdminView/DeleteConfirmModal';
import UserDetailModal from './components/AdminView/UserDetailModal';

// Tinder & User Profile Components
import TinderDeck from './components/TinderView/TinderDeck';
import TinderMatches from './components/TinderView/TinderMatches';
import MiPerfilTab from './components/TinderView/MiPerfilTab';
import MatchCelebrationModal from './components/TinderView/MatchCelebrationModal';

export default function App() {
  // Theme state (Dark Mode support)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('matchify_theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('matchify_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('matchify_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Auth & Session State
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('matchify_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Navigation Tabs
  const [currentAdminTab, setCurrentAdminTab] = useState('usuarios');
  const [currentUserTab, setCurrentUserTab] = useState('swipe'); // 'swipe' | 'matches' | 'perfil'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data States
  const [usuarios, setUsuarios] = useState([]);
  const [hobbies, setHobbies] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isApiOnline, setIsApiOnline] = useState(true);

  // Tinder Session State
  const [currentTinderUserId, setCurrentTinderUserId] = useState(null);
  const [sessionMatches, setSessionMatches] = useState([]);
  const [celebrationData, setCelebrationData] = useState(null); // { currentUser, matchedUser, commonHobbies }
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [blockedUserIds, setBlockedUserIds] = useState([]);

  const [candidatos, setCandidatos] = useState([]);
  const [seenByUser, setSeenByUser] = useState({});
  const [tinderLoading, setTinderLoading] = useState(false);
  const [tinderError, setTinderError] = useState('');
  const [refreshTinder, setRefreshTinder] = useState(0);
  const [savingInteraction, setSavingInteraction] = useState(false);
  const interactionLock = useRef(false);
  const activeUserRef = useRef(currentTinderUserId);
  activeUserRef.current = currentTinderUserId;

  useEffect(() => {
    let cancelled = false;
    setCelebrationData(null);
    setSessionMatches([]);
    setCandidatos([]);
    setTinderError('');
    if (!currentTinderUserId || session?.role !== 'user') return;
    setTinderLoading(true);
    Promise.allSettled([
      api.getCandidatos(currentTinderUserId),
      api.getMatches(currentTinderUserId),
    ]).then(([candidateResult, matchResult]) => {
      if (cancelled) return;
      if (candidateResult.status === 'fulfilled') setCandidatos(candidateResult.value);
      if (matchResult.status === 'fulfilled') {
        setSessionMatches(matchResult.value.map((match) => {
          const other = match.usuario1Id === currentTinderUserId ? match.usuario2 : match.usuario1;
          return { ...usuarios.find((u) => u.id === other.id), ...other };
        }));
      }
      const errors = [candidateResult, matchResult]
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason.message);
      setTinderError(errors.join('. '));
      setTinderLoading(false);
    });
    return () => { cancelled = true; };
  }, [currentTinderUserId, session?.role, currentUserTab, refreshTinder, usuarios]);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Modals
  const [usuarioModal, setUsuarioModal] = useState({ open: false, data: null });
  const [hobbieModal, setHobbieModal] = useState({ open: false, data: null });
  const [ubicacionModal, setUbicacionModal] = useState({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, onConfirm: null, title: '', message: '' });
  const [detailModal, setDetailModal] = useState({ open: false, usuario: null });
  const [reportModal, setReportModal] = useState({ open: false, user: null });

  // 1. Cargar datos al iniciar
  useEffect(() => {
    checkHealth();
    cargarTodo();
  }, []);

  // Keyboard accessibility: ESC cierra cualquier modal abierto
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        cerrarTodosLosModales();
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cerrarTodosLosModales = () => {
    setUsuarioModal({ open: false, data: null });
    setHobbieModal({ open: false, data: null });
    setUbicacionModal({ open: false, data: null });
    setDeleteModal({ open: false, onConfirm: null, title: '', message: '' });
    setDetailModal({ open: false, usuario: null });
    setCelebrationData(null);
    setReportModal({ open: false, user: null });
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const checkHealth = async () => {
    try {
      await api.getHealth();
      setIsApiOnline(true);
    } catch {
      setIsApiOnline(false);
    }
  };

  const cargarTodo = async () => {
    setLoading(true);
    try {
      const [ubics, hobs, usrs] = await Promise.all([
        api.getUbicaciones().catch(() => []),
        api.getHobbies().catch(() => []),
        api.getUsuarios().catch(() => []),
      ]);
      setUbicaciones(ubics || []);
      setHobbies(hobs || []);
      setUsuarios(usrs || []);

      if (usrs?.length > 0) {
        setCurrentTinderUserId((prev) => {
          if (prev) return prev;
          try {
            const saved = localStorage.getItem('matchify_session');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.role !== 'admin' && parsed.user?.id) {
                return parsed.user.id;
              }
            }
          } catch {}
          return usrs[0].id;
        });
      }
    } catch (err) {
      console.warn('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // AUTH HANDLERS
  // =========================================================================
  const handleLogin = (sessionData) => {
    const isAdm = sessionData?.role === 'admin';
    const safeSession = {
      role: isAdm ? 'admin' : 'user',
      nombre: sessionData?.nombre || sessionData?.user?.nombre || 'Administrador',
      apellido: sessionData?.apellido || sessionData?.user?.apellido || 'Matchify',
      email: sessionData?.email || sessionData?.user?.email || (isAdm ? 'admin@matchify.com' : 'usuario@matchify.com'),
      user: sessionData?.user || {
        id: 0,
        nombre: sessionData?.nombre || 'Administrador',
        apellido: sessionData?.apellido || 'Matchify',
        email: sessionData?.email || 'admin@matchify.com',
        activo: true,
      },
    };

    setSession(safeSession);
    if (!isAdm && safeSession.user?.id) {
      setCurrentTinderUserId(safeSession.user.id);
    }
    localStorage.setItem('matchify_session', JSON.stringify(safeSession));
    showToast(
      `¡Bienvenido/a, ${safeSession.role === 'admin' ? 'Administrador' : safeSession.user?.nombre || 'Usuario'}!`,
      'success'
    );
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('matchify_session');
    setSessionMatches([]);
    setActiveChatUser(null);
    setCurrentTinderUserId(null);
    showToast('Sesión finalizada', 'info');
  };

  const handleOpenChatFromMatch = (matchedUser) => {
    setActiveChatUser(matchedUser);
    setCurrentUserTab('matches');
  };

  const handleRegisterUser = async (formData) => {
    const nuevo = await api.crearUsuario(formData);
    await cargarTodo();
    return nuevo;
  };

  // Safety report handler
  const handleSubmitReport = ({ userId, userName, reason, blocked }) => {
    if (blocked) {
      setBlockedUserIds((prev) => [...prev, userId]);
      setSessionMatches((prev) => prev.filter((m) => m.id !== userId));
      if (activeChatUser?.id === userId) setActiveChatUser(null);
      showToast(`Has reportado y bloqueado a ${userName}`, 'info');
    } else {
      showToast(`Reporte enviado para ${userName}`, 'info');
    }
  };

  // Stats calculation
  const totalActivos = usuarios.filter((u) => u.activo !== false).length;
  const stats = {
    totalUsuarios: usuarios.length,
    activos: totalActivos,
    inactivos: usuarios.length - totalActivos,
    totalHobbies: hobbies.length,
    totalUbicaciones: ubicaciones.length,
    matchesCount: sessionMatches.length,
  };

  // =========================================================================
  // HANDLERS: USUARIOS CRUD (ADMIN)
  // =========================================================================
  const handleGuardarUsuario = async (formData) => {
    try {
      if (usuarioModal.data) {
        await api.actualizarUsuario(usuarioModal.data.id, formData);
        showToast(`Usuario "${formData.nombre}" actualizado con éxito`, 'success');
      } else {
        await api.crearUsuario(formData);
        showToast(`Usuario "${formData.nombre}" creado con éxito`, 'success');
      }
      setUsuarioModal({ open: false, data: null });
      cargarTodo();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEliminarUsuario = (usuario) => {
    setDeleteModal({
      open: true,
      title: `¿Eliminar a ${usuario.nombre} ${usuario.apellido}?`,
      message: `Se eliminará el perfil y todas sus asociaciones de hobbies.`,
      onConfirm: async () => {
        try {
          await api.eliminarUsuario(usuario.id);
          showToast(`Usuario "${usuario.nombre}" eliminado`, 'success');
          setDeleteModal({ open: false, onConfirm: null, title: '', message: '' });
          cargarTodo();
        } catch (err) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  // =========================================================================
  // HANDLERS: HOBBIES CRUD (ADMIN)
  // =========================================================================
  const handleGuardarHobbie = async (formData) => {
    try {
      if (hobbieModal.data) {
        const updated = await api.actualizarHobbie(hobbieModal.data.id, formData);
        setHobbies((prev) =>
          prev.map((h) => (h.id === hobbieModal.data.id ? { ...h, ...formData, ...updated } : h))
        );
        showToast(`Hobbie "${formData.nombre}" actualizado`, 'success');
      } else {
        const created = await api.crearHobbie(formData);
        if (created?.id) {
          setHobbies((prev) => [...prev, created]);
        }
        showToast(`Hobbie "${formData.nombre}" creado`, 'success');
      }
      setHobbieModal({ open: false, data: null });
      cargarTodo();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEliminarHobbie = (hobbie) => {
    setDeleteModal({
      open: true,
      title: `¿Eliminar hobbie "${hobbie.nombre}"?`,
      message: `Se quitará del catálogo y de todos los usuarios asignados.`,
      onConfirm: async () => {
        try {
          await api.eliminarHobbie(hobbie.id);
          showToast(`Hobbie "${hobbie.nombre}" eliminado`, 'success');
          setDeleteModal({ open: false, onConfirm: null, title: '', message: '' });
          cargarTodo();
        } catch (err) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  // =========================================================================
  // HANDLERS: UBICACIONES CRUD (ADMIN)
  // =========================================================================
  const handleGuardarUbicacion = async (formData) => {
    try {
      if (ubicacionModal.data) {
        await api.actualizarUbicacion(ubicacionModal.data.id, formData);
        showToast(`Ubicación "${formData.ciudad}" actualizada`, 'success');
      } else {
        await api.crearUbicacion(formData);
        showToast(`Ubicación "${formData.ciudad}" creada`, 'success');
      }
      setUbicacionModal({ open: false, data: null });
      cargarTodo();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEliminarUbicacion = (ubicacion) => {
    setDeleteModal({
      open: true,
      title: `¿Eliminar "${ubicacion.ciudad}"?`,
      message: `Se desvinculará de cualquier usuario asociado.`,
      onConfirm: async () => {
        try {
          await api.eliminarUbicacion(ubicacion.id);
          showToast(`Ubicación "${ubicacion.ciudad}" eliminada`, 'success');
          setDeleteModal({ open: false, onConfirm: null, title: '', message: '' });
          cargarTodo();
        } catch (err) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  // =========================================================================
  // HANDLERS: TINDER SWIPING (NORMAL USER)
  // =========================================================================
  const handleTinderSwipe = async (swipedUser, direction) => {
    if (!currentTinderUserId || interactionLock.current) return false;
    const usuarioId = currentTinderUserId;
    const tipo = direction === 'left' ? 'DISLIKE' : 'LIKE';
    interactionLock.current = true;
    setSavingInteraction(true);
    try {
      const result = await api.crearInteraccion(usuarioId, swipedUser.id, tipo);
      setSeenByUser((prev) => ({
        ...prev, [usuarioId]: [...(prev[usuarioId] || []), swipedUser.id],
      }));
      if (activeUserRef.current !== usuarioId) return true;
      if (tipo === 'LIKE' && result.match != null) {
        const currentUser = usuarios.find((u) => u.id === usuarioId);
        const myHobbyIds = (currentUser?.hobbies || []).map((h) => (h.hobbie || h).id || h.hobbieId);
        const commonHobbies = (swipedUser.hobbies || []).map((h) => h.hobbie || h)
          .filter((h) => myHobbyIds.includes(h.id));
        setSessionMatches((prev) => prev.some((u) => u.id === swipedUser.id) ? prev : [...prev, swipedUser]);
        setCelebrationData({ currentUser, matchedUser: swipedUser, commonHobbies });
      } else {
        showToast(tipo === 'LIKE' ? `Le diste like a ${swipedUser.nombre} 👍` : `Pasaste el perfil de ${swipedUser.nombre}`, 'success');
      }
      return true;
    } catch (err) {
      if (activeUserRef.current === usuarioId) showToast(err.message, 'error');
      return false;
    } finally {
      interactionLock.current = false;
      setSavingInteraction(false);
    }
  };

  // Header Title Helper
  const getHeaderTitle = () => {
    if (currentAdminTab === 'usuarios') return 'Gestión de Usuarios';
    if (currentAdminTab === 'hobbies') return 'Catálogo de Hobbies';
    if (currentAdminTab === 'ubicaciones') return 'Gestión de Ubicaciones';
    return 'Panel de Administración';
  };

  const getPrimaryActionText = () => {
    if (currentAdminTab === 'usuarios') return '+ Nuevo Usuario';
    if (currentAdminTab === 'hobbies') return '+ Nuevo Hobbie';
    if (currentAdminTab === 'ubicaciones') return '+ Nueva Ubicación';
    return null;
  };

  const handlePrimaryActionClick = () => {
    if (currentAdminTab === 'usuarios') setUsuarioModal({ open: true, data: null });
    if (currentAdminTab === 'hobbies') setHobbieModal({ open: true, data: null });
    if (currentAdminTab === 'ubicaciones') setUbicacionModal({ open: true, data: null });
  };

  // =========================================================================
  // SI NO HAY SESIÓN: MOSTRAR PANTALLA DE LOGIN / REGISTRO
  // =========================================================================
  if (!session) {
    return (
      <div className="auth-root-layout">
        <Toast toasts={toasts} />
        <AuthView
          usuarios={usuarios}
          ubicaciones={ubicaciones}
          onLogin={handleLogin}
          onRegister={handleRegisterUser}
          onShowToast={showToast}
        />
      </div>
    );
  }

  const isAdmin = session.role === 'admin';
  const currentLoggedInUser = session.user;

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <Toast toasts={toasts} />

      {/* Top Navbar para móviles */}
      <NavbarMobile
        session={session}
        onLogout={handleLogout}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Sidebar Lateral con Navegación según Rol */}
      <Sidebar
        session={session}
        onLogout={handleLogout}
        currentAdminTab={currentAdminTab}
        setCurrentAdminTab={setCurrentAdminTab}
        currentUserTab={currentUserTab}
        setCurrentUserTab={setCurrentUserTab}
        stats={stats}
        isApiOnline={isApiOnline}
        checkHealth={checkHealth}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Contenido Principal */}
      <main className="main-content">
        {/* =========================================================================
            VISTA 1: EXCLUSIVA PARA ADMINISTRADOR
            ========================================================================= */}
        {isAdmin && (
          <div className="app-view-container">
            {/* Header del Admin */}
            <header className="top-header">
              <div className="header-info">
                <h2>{getHeaderTitle()}</h2>
                <p>Panel de control y gestión global de la base de datos de Matchify.</p>
              </div>
              {getPrimaryActionText() && (
                <div className="header-actions">
                  <button
                    className="btn btn-primary shadow-sm"
                    onClick={handlePrimaryActionClick}
                  >
                    {getPrimaryActionText()}
                  </button>
                </div>
              )}
            </header>

            {/* KPI Stats Cards */}
            <DevResetPanel
              usuarios={usuarios}
              currentUserId={currentTinderUserId}
              onShowToast={showToast}
              onReset={() => {
                setSeenByUser({});
                setCandidatos([]);
                setSessionMatches([]);
                setCelebrationData(null);
                setActiveChatUser(null);
                setTinderError('');
                setRefreshTinder((n) => n + 1);
              }}
            />
            <StatsGrid stats={stats} onSelectTab={(tab) => setCurrentAdminTab(tab)} />

            {/* Pestañas del Admin */}
            {currentAdminTab === 'usuarios' && (
              <UsuariosTab
                usuarios={usuarios}
                loading={loading}
                onRefresh={cargarTodo}
                onOpenCreate={() => setUsuarioModal({ open: true, data: null })}
                onOpenEdit={(u) => setUsuarioModal({ open: true, data: u })}
                onOpenDelete={handleEliminarUsuario}
                onOpenDetail={(u) => setDetailModal({ open: true, usuario: u })}
              />
            )}

            {currentAdminTab === 'hobbies' && (
              <HobbiesTab
                hobbies={hobbies}
                loading={loading}
                onRefresh={cargarTodo}
                onOpenCreate={() => setHobbieModal({ open: true, data: null })}
                onOpenEdit={(h) => setHobbieModal({ open: true, data: h })}
                onOpenDelete={handleEliminarHobbie}
              />
            )}

            {currentAdminTab === 'ubicaciones' && (
              <UbicacionesTab
                ubicaciones={ubicaciones}
                loading={loading}
                onRefresh={cargarTodo}
                onOpenCreate={() => setUbicacionModal({ open: true, data: null })}
                onOpenEdit={(ub) => setUbicacionModal({ open: true, data: ub })}
                onOpenDelete={handleEliminarUbicacion}
              />
            )}
          </div>
        )}

        {/* =========================================================================
            VISTA 2: EXCLUSIVA PARA USUARIO CON PERFIL NORMAL
            ========================================================================= */}
        {!isAdmin && (
          <div className="app-view-container">

            {/* Top Bar Tinder: Selector de usuario activo */}
            <div className="tinder-top-bar">
              <div className="tinder-identity-box">
                <span className="tinder-id-label">Navegando como:</span>

                <select
                  className="form-control tinder-select-user"
                  disabled={savingInteraction}
                  value={currentTinderUserId || ''}
                  onChange={(e) =>
                    setCurrentTinderUserId(parseInt(e.target.value, 10))
                  }
                >
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} {u.apellido} (ID #{u.id})
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="tinder-stats-pill"
                onClick={() => setCurrentUserTab('matches')}
              >
                <span>💬 Matches:</span>{' '}
                <strong>{sessionMatches.length}</strong>
              </div>
            </div>

            {/* Vista de Deslizar Perfiles */}
            {tinderError && (
              <div role="alert">
                {tinderError}{' '}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setRefreshTinder((n) => n + 1)}
                >
                  Reintentar
                </button>
              </div>
            )}

            {tinderLoading && (
              <p role="status">
                Cargando candidatos y matches…
              </p>
            )}

            {currentUserTab === 'swipe' && !tinderLoading && (
              <TinderDeck
                key={currentTinderUserId}
                usuarios={usuarios}
                candidatos={candidatos.filter(
                  (u) =>
                    !(seenByUser[currentTinderUserId] || []).includes(u.id) &&
                    !sessionMatches.some((m) => m.id === u.id) &&
                    !blockedUserIds.includes(u.id)
                )}
                disabled={savingInteraction}
                currentUserId={currentTinderUserId}
                currentUser={usuarios.find(
                  (u) => u.id === currentTinderUserId
                )}
                onSwipe={handleTinderSwipe}
                onRewind={() =>
                  setRefreshTinder((n) => n + 1)
                }
                onOpenDetail={(u) =>
                  setDetailModal({
                    open: true,
                    usuario: u,
                  })
                }
                onOpenReport={(u) => setReportModal({ open: true, user: u })}
                blockedUserIds={blockedUserIds}
              />
            )}

            {/* Pestaña: Mis Matches & Chat Split View */}
            {currentUserTab === 'matches' && !tinderLoading && (
              <TinderMatches
                matches={sessionMatches}
                onBackToExplore={() => setCurrentUserTab('swipe')}
                onOpenDetail={(u) =>
                  setDetailModal({
                    open: true,
                    usuario: u,
                  })
                }
                onOpenReport={(u) => setReportModal({ open: true, user: u })}
                onShowToast={showToast}
                activeChatUser={activeChatUser}
                onSelectChatUser={(u) => setActiveChatUser(u)}
              />
            )}

            {/* Pestaña: Mi Perfil y Hobbies */}
            {currentUserTab === 'perfil' && (
              <MiPerfilTab
                currentUser={currentLoggedInUser}
                ubicaciones={ubicaciones}
                hobbies={hobbies}
                onProfileUpdated={cargarTodo}
                onPreferencesUpdated={() => setRefreshTinder((n) => n + 1)}
                onShowToast={showToast}
              />
            )}
          </div>
        )}
      </main>

      {/* =========================================================================
          BOTTOM NAVIGATION BAR (MÓVIL - USUARIO NORMAL)
          ========================================================================= */}
      {!isAdmin && (
        <BottomNav
          currentUserTab={currentUserTab}
          setCurrentUserTab={setCurrentUserTab}
          matchesCount={sessionMatches.length}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      )}

      {/* =========================================================================
          MODALES GLOBALES
          ========================================================================= */}
      {isAdmin && (
        <>
          <UsuarioModal
            isOpen={usuarioModal.open}
            usuario={usuarioModal.data}
            ubicaciones={ubicaciones}
            onClose={() => setUsuarioModal({ open: false, data: null })}
            onSubmit={handleGuardarUsuario}
          />

          <HobbieModal
            isOpen={hobbieModal.open}
            hobbie={hobbieModal.data}
            onClose={() => setHobbieModal({ open: false, data: null })}
            onSubmit={handleGuardarHobbie}
          />

          <UbicacionModal
            isOpen={ubicacionModal.open}
            ubicacion={ubicacionModal.data}
            onClose={() => setUbicacionModal({ open: false, data: null })}
            onSubmit={handleGuardarUbicacion}
          />

          <DeleteConfirmModal
            isOpen={deleteModal.open}
            title={deleteModal.title}
            message={deleteModal.message}
            onClose={() => setDeleteModal({ open: false, onConfirm: null, title: '', message: '' })}
            onConfirm={deleteModal.onConfirm}
          />
        </>
      )}

      <UserDetailModal
        isOpen={detailModal.open}
        usuario={detailModal.usuario}
        onClose={() => setDetailModal({ open: false, usuario: null })}
      />

      <MatchCelebrationModal
        isOpen={Boolean(celebrationData)}
        currentUser={celebrationData?.currentUser}
        matchedUser={celebrationData?.matchedUser}
        commonHobbies={celebrationData?.commonHobbies}
        onClose={() => setCelebrationData(null)}
        onOpenChatWithUser={handleOpenChatFromMatch}
      />

      <ReportModal
        isOpen={reportModal.open}
        userToReport={reportModal.user}
        onClose={() => setReportModal({ open: false, user: null })}
        onSubmitReport={handleSubmitReport}
      />
    </div>
  );
}
