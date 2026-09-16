import React, { useState, useEffect } from 'react';
import './App.css';
import { api } from './services/api';

// Componentes
import Sidebar from './components/Sidebar';
import NavbarMobile from './components/NavbarMobile';
import Toast from './components/Toast';

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

// Tinder Components
import TinderDeck from './components/TinderView/TinderDeck';
import TinderMatches from './components/TinderView/TinderMatches';
import MatchCelebrationModal from './components/TinderView/MatchCelebrationModal';

export default function App() {
  // Navigation & Mode
  const [appMode, setAppMode] = useState('admin'); // 'admin' | 'user'
  const [currentAdminTab, setCurrentAdminTab] = useState('usuarios');
  const [currentUserTab, setCurrentUserTab] = useState('swipe');
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

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Modals
  const [usuarioModal, setUsuarioModal] = useState({ open: false, data: null });
  const [hobbieModal, setHobbieModal] = useState({ open: false, data: null });
  const [ubicacionModal, setUbicacionModal] = useState({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, onConfirm: null, title: '', message: '' });
  const [detailModal, setDetailModal] = useState({ open: false, usuario: null });

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
        api.getUbicaciones(),
        api.getHobbies(),
        api.getUsuarios(),
      ]);
      setUbicaciones(ubics);
      setHobbies(hobs);
      setUsuarios(usrs);

      if (usrs.length > 0 && !currentTinderUserId) {
        setCurrentTinderUserId(usrs[0].id);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
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
  // HANDLERS: USUARIOS CRUD
  // =========================================================================
  const handleGuardarUsuario = async (formData) => {
    try {
      if (usuarioModal.data) {
        // Actualizar
        await api.actualizarUsuario(usuarioModal.data.id, formData);
        showToast(`Usuario "${formData.nombre}" actualizado con éxito`, 'success');
      } else {
        // Crear
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
  // HANDLERS: HOBBIES CRUD
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
  // HANDLERS: UBICACIONES CRUD
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
  // HANDLERS: TINDER SWIPING
  // =========================================================================
  const handleTinderSwipe = (swipedUser, direction) => {
    if (direction === 'right' || direction === 'up') {
      const currentUser = usuarios.find((u) => u.id === currentTinderUserId);
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

      // Disparar celebración de match si tienen hobbies en común o es superlike o probabilidad alta
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

  // Header Title Helper
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

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <Toast toasts={toasts} />

      {/* Top Navbar para móviles */}
      <NavbarMobile
        appMode={appMode}
        setAppMode={setAppMode}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Sidebar Lateral */}
      <Sidebar
        appMode={appMode}
        setAppMode={setAppMode}
        currentAdminTab={currentAdminTab}
        setCurrentAdminTab={setCurrentAdminTab}
        currentUserTab={currentUserTab}
        setCurrentUserTab={setCurrentUserTab}
        stats={stats}
        isApiOnline={isApiOnline}
        checkHealth={checkHealth}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Contenido Principal */}
      <main className="main-content">
        {/* =========================================================================
            VISTA 1: ADMIN DASHBOARD
            ========================================================================= */}
        {appMode === 'admin' && (
          <div className="app-view-container">
            {/* Header del Admin */}
            <header className="top-header">
              <div className="header-info">
                <h2>{getHeaderTitle()}</h2>
                <p>Prueba los endpoints CRUD de la API en tiempo real con React.</p>
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
            VISTA 2: TINDER USER EXPERIENCE
            ========================================================================= */}
        {appMode === 'user' && (
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
              />
            )}

            {/* Vista de Matches */}
            {currentUserTab === 'matches' && (
              <TinderMatches
                matches={sessionMatches}
                onBackToExplore={() => setCurrentUserTab('swipe')}
                onOpenDetail={(u) => setDetailModal({ open: true, usuario: u })}
                onShowToast={showToast}
              />
            )}
          </div>
        )}
      </main>

      {/* =========================================================================
          MODALES GLOBALES
          ========================================================================= */}
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
        onGoToMatches={() => setCurrentUserTab('matches')}
      />
    </div>
  );
}
