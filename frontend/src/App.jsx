import React, { useState, useEffect } from 'react';
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
import UsuariosTab from './components/AdminView/UsuariosTab';
import HobbiesTab from './components/AdminView/HobbiesTab';
import UbicacionesTab from './components/AdminView/UbicacionesTab';
import RelacionesTab from './components/AdminView/RelacionesTab';
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
    } catch (err) {
      console.warn('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setLoading(true);
    showToast('Generando datos de prueba en la base de datos...', 'info');
    try {
      await api.seedInitialData();
      await cargarTodo();
      showToast('¡Datos de prueba cargados con éxito! 🎉', 'success');
    } catch (err) {
      showToast(err.message || 'Error al cargar datos demo', 'error');
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
    showToast('Sesión finalizada', 'info');
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
    totalRelaciones: usuarios.reduce((acc, u) => acc + (u.hobbies ? u.hobbies.length : 0), 0),
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
        await api.actualizarHobbie(hobbieModal.data.id, formData);
        showToast(`Hobbie "${formData.nombre}" actualizado`, 'success');
      } else {
        await api.crearHobbie(formData);
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
  const handleTinderSwipe = (swipedUser, direction) => {
    if (direction === 'right' || direction === 'up') {
      const currentUser = session?.user;
      const myHobbyIds =
        currentUser && currentUser.hobbies
          ? currentUser.hobbies.map((h) => (h.hobbie || h).id || h.hobbieId)
          : [];

      const userHobbies = swipedUser.hobbies ? swipedUser.hobbies.map((h) => h.hobbie || h) : [];
      const commonHobbies = userHobbies.filter((h) => myHobbyIds.includes(h.id));

      // Agregar a la lista de matches de la sesión
      if (!sessionMatches.some((m) => m.id === swipedUser.id)) {
        setSessionMatches((prev) => [
          ...prev,
          { ...swipedUser, commonHobbies, matchedAt: new Date() },
        ]);
      }

      // Celebración de match
      if (direction === 'up' || commonHobbies.length > 0 || Math.random() > 0.3) {
        setCelebrationData({
          currentUser,
          matchedUser: swipedUser,
          commonHobbies,
        });
      } else {
        showToast(`Le diste like a ${swipedUser.nombre} 👍`, 'success');
      }
    } else {
      showToast(`Pasaste el perfil de ${swipedUser.nombre}`, 'info');
    }
  };

  const handleOpenChatFromMatch = (matchedUser) => {
    setActiveChatUser(matchedUser);
    setCurrentUserTab('matches');
  };

  // Dynamic Header Title
  const getHeaderTitle = () => {
    if (currentAdminTab === 'usuarios') return 'Gestión de Usuarios';
    if (currentAdminTab === 'hobbies') return 'Catálogo de Hobbies';
    if (currentAdminTab === 'ubicaciones') return 'Gestión de Ubicaciones';
    if (currentAdminTab === 'relaciones') return 'Asignación de Hobbies';
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
              <div className="header-actions" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary shadow-sm"
                  onClick={handleSeedData}
                  title="Poblar base de datos con datos de prueba iniciales"
                >
                  🌱 Cargar Datos Demo
                </button>
                {getPrimaryActionText() && (
                  <button
                    className="btn btn-primary shadow-sm"
                    onClick={handlePrimaryActionClick}
                  >
                    {getPrimaryActionText()}
                  </button>
                )}
              </div>
            </header>

            {/* KPI Stats Cards */}
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

            {currentAdminTab === 'relaciones' && (
              <RelacionesTab
                usuarios={usuarios}
                hobbies={hobbies}
                onRelationChanged={cargarTodo}
                onShowToast={showToast}
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
                  value={currentTinderUserId || ''}
                  onChange={(e) => setCurrentTinderUserId(parseInt(e.target.value, 10))}
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
                <span>💬 Matches:</span> <strong>{sessionMatches.length}</strong>
              </div>
            </div>

            {/* Vista de Deslizar Perfiles (Swipe Deck) */}
            {currentUserTab === 'swipe' && (
              <TinderDeck
                usuarios={usuarios}
                currentUserId={currentTinderUserId}
                onSwipe={handleTinderSwipe}
                onRewind={() => showToast('Baraja reiniciada 🔄', 'info')}
                onOpenDetail={(u) => setDetailModal({ open: true, usuario: u })}
                onOpenReport={(u) => setReportModal({ open: true, user: u })}
                blockedUserIds={blockedUserIds}
              />
            )}

            {/* Pestaña: Mis Matches & Chat Split View */}
            {currentUserTab === 'matches' && (
              <TinderMatches
                matches={sessionMatches}
                onBackToExplore={() => setCurrentUserTab('swipe')}
                onOpenDetail={(u) => setDetailModal({ open: true, usuario: u })}
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
