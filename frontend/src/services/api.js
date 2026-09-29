// En desarrollo con Vite, el proxy redirige automáticamente /api al backend en http://localhost:3000
const API_BASE = '/api';

// Helper para limpiar el payload de usuario según lo permitido por backend/prisma
const cleanUserPayload = (data) => {
  const payload = {};
  if (data.nombre !== undefined) payload.nombre = String(data.nombre).trim();
  if (data.apellido !== undefined) payload.apellido = String(data.apellido).trim();
  if (data.email !== undefined) payload.email = String(data.email).trim().toLowerCase();

  // Fecha de nacimiento obligatoria y válida
  if (data.fechaNacimiento) {
    payload.fechaNacimiento = new Date(data.fechaNacimiento).toISOString();
  } else {
    payload.fechaNacimiento = new Date('2000-01-01').toISOString();
  }

  if (data.biografia !== undefined) {
    payload.biografia = data.biografia === null ? null : String(data.biografia).trim();
  }

  if (data.activo !== undefined) payload.activo = Boolean(data.activo);

  if (data.ubicacionId !== undefined && data.ubicacionId !== null && data.ubicacionId !== '') {
    payload.ubicacionId = parseInt(data.ubicacionId, 10);
  } else {
    payload.ubicacionId = null;
  }

  if (data.tipoUsuarioId !== undefined && data.tipoUsuarioId !== null && data.tipoUsuarioId !== '') {
    payload.tipoUsuarioId = parseInt(data.tipoUsuarioId, 10);
  }

  return payload;
};

export const api = {
  async getPreferencia(usuarioId) {
    const res = await fetch(`${API_BASE}/usuarios/${usuarioId}/preferencia`);
    const data = await res.json();
    if (res.status === 404 && data.error === 'Preferencia no encontrada') return null;
    if (!res.ok) throw new Error(data.message || data.error || 'Error al cargar preferencias');
    return data;
  },

  async guardarPreferencia(usuarioId, data, existe) {
    const res = await fetch(`${API_BASE}/usuarios/${usuarioId}/preferencia`, {
      method: existe ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Error al guardar preferencias');
    return json;
  },

  async getResetHabilitado() {
    const res = await fetch(`${API_BASE}/dev/interacciones`);
    if (res.status === 403) return false;
    if (!res.ok) throw new Error('No se pudo verificar la herramienta de desarrollo');
    return (await res.json()).habilitado === true;
  },

  async resetearInteracciones(usuarioId) {
    const path = usuarioId === undefined ? '/dev/interacciones' : `/dev/usuarios/${usuarioId}/interacciones`;
    const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al resetear interacciones');
    return data;
  },

  async getCandidatos(usuarioId) {
    const res = await fetch(`${API_BASE}/usuarios/${usuarioId}/candidatos`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Error al obtener candidatos');
    return data;
  },

  async getMatches(usuarioId) {
    const res = await fetch(`${API_BASE}/matches/${usuarioId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Error al obtener matches');
    return data;
  },

  async crearInteraccion(usuarioEmisorId, usuarioDestinatarioId, tipo) {
    const res = await fetch(`${API_BASE}/interacciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioEmisorId, usuarioDestinatarioId, tipo }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Error al guardar interacción');
    return data;
  },

  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Error al verificar API');
    return res.json();
  },

  // Usuarios
  async getCandidatos(usuarioId) {
    const res = await fetch(`${API_BASE}/usuarios/${usuarioId}/candidatos`);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || 'Error al obtener candidatos');
    }
    return res.json();
  },

  async getUsuarios() {
    const res = await fetch(`${API_BASE}/usuarios`);
    if (!res.ok) throw new Error('Error al obtener usuarios');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async crearUsuario(data) {
    const payload = cleanUserPayload(data);
    const res = await fetch(`${API_BASE}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Error al crear usuario');
    return json;
  },

  async actualizarUsuario(id, data) {
    const payload = cleanUserPayload(data);
    const res = await fetch(`${API_BASE}/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Error al actualizar usuario');
    return json;
  },

  async eliminarUsuario(id) {
    const res = await fetch(`${API_BASE}/usuarios/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.message || json.error || 'Error al eliminar usuario');
    }
    return true;
  },

  // Hobbies
  async getHobbies() {
    const res = await fetch(`${API_BASE}/hobbies`);
    if (!res.ok) throw new Error('Error al obtener hobbies');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async crearHobbie(data) {
    const payload = {
      nombre: String(data.nombre || '').trim(),
      emoji: data.emoji ? String(data.emoji).trim() : null,
    };
    const res = await fetch(`${API_BASE}/hobbies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Error al crear hobbie');
    return json;
  },

  async actualizarHobbie(id, data) {
    const payload = {
      nombre: String(data.nombre || '').trim(),
      emoji: data.emoji ? String(data.emoji).trim() : null,
    };
    const res = await fetch(`${API_BASE}/hobbies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Error al actualizar hobbie');
    return json;
  },

  async eliminarHobbie(id) {
    const res = await fetch(`${API_BASE}/hobbies/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.message || json.error || 'Error al eliminar hobbie');
    }
    return true;
  },

  // Ubicaciones
  async getUbicaciones() {
    const res = await fetch(`${API_BASE}/ubicaciones`);
    if (!res.ok) throw new Error('Error al obtener ubicaciones');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async crearUbicacion(data) {
    const payload = {
      ciudad: String(data.ciudad || '').trim(),
      provincia: String(data.provincia || '').trim(),
      pais: String(data.pais || 'Argentina').trim(),
      latitud: typeof data.latitud === 'number' ? data.latitud : (parseFloat(data.latitud) || -32.9468),
      longitud: typeof data.longitud === 'number' ? data.longitud : (parseFloat(data.longitud) || -60.6393),
    };
    const res = await fetch(`${API_BASE}/ubicaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Error al crear ubicación');
    return json;
  },

  async actualizarUbicacion(id, data) {
    const payload = {
      ciudad: String(data.ciudad || '').trim(),
      provincia: String(data.provincia || '').trim(),
      pais: String(data.pais || 'Argentina').trim(),
      latitud: typeof data.latitud === 'number' ? data.latitud : (parseFloat(data.latitud) || -32.9468),
      longitud: typeof data.longitud === 'number' ? data.longitud : (parseFloat(data.longitud) || -60.6393),
    };
    const res = await fetch(`${API_BASE}/ubicaciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Error al actualizar ubicación');
    return json;
  },

  async eliminarUbicacion(id) {
    const res = await fetch(`${API_BASE}/ubicaciones/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.message || json.error || 'Error al eliminar ubicación');
    }
    return true;
  },

  // Relaciones Usuario - Hobbies
  async getHobbiesDeUsuario(usuarioId) {
    const res = await fetch(`${API_BASE}/usuarios/${usuarioId}/hobbies`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async asociarHobbie(usuarioId, hobbieId) {
    const res = await fetch(`${API_BASE}/usuarios/${usuarioId}/hobbies/${hobbieId}`, {
      method: 'POST',
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || json.error || 'Error al asociar hobbie');
    return json;
  },

  async desasociarHobbie(usuarioId, hobbieId) {
    const res = await fetch(`${API_BASE}/usuarios/${usuarioId}/hobbies/${hobbieId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.message || json.error || 'Error al desasociar hobbie');
    }
    return true;
  },
};
