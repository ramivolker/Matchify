// En desarrollo con Vite, el proxy redirige automáticamente /api al backend en http://localhost:3000
const API_BASE = '/api';

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Error al verificar API');
    return res.json();
  },

  // Usuarios
  async getUsuarios() {
    const res = await fetch(`${API_BASE}/usuarios`);
    if (!res.ok) throw new Error('Error al obtener usuarios');
    return res.json();
  },

  async crearUsuario(data) {
    const res = await fetch(`${API_BASE}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al crear usuario');
    return json;
  },

  async actualizarUsuario(id, data) {
    const res = await fetch(`${API_BASE}/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al actualizar usuario');
    return json;
  },

  async eliminarUsuario(id) {
    const res = await fetch(`${API_BASE}/usuarios/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.message || 'Error al eliminar usuario');
    }
    return true;
  },

  // Hobbies
  async getHobbies() {
    const res = await fetch(`${API_BASE}/hobbies`);
    if (!res.ok) throw new Error('Error al obtener hobbies');
    return res.json();
  },

  async crearHobbie(data) {
    const res = await fetch(`${API_BASE}/hobbies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al crear hobbie');
    return json;
  },

  async actualizarHobbie(id, data) {
    const res = await fetch(`${API_BASE}/hobbies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al actualizar hobbie');
    return json;
  },

  async eliminarHobbie(id) {
    const res = await fetch(`${API_BASE}/hobbies/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.message || 'Error al eliminar hobbie');
    }
    return true;
  },

  // Ubicaciones
  async getUbicaciones() {
    const res = await fetch(`${API_BASE}/ubicaciones`);
    if (!res.ok) throw new Error('Error al obtener ubicaciones');
    return res.json();
  },

  async crearUbicacion(data) {
    const res = await fetch(`${API_BASE}/ubicaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al crear ubicación');
    return json;
  },

  async actualizarUbicacion(id, data) {
    const res = await fetch(`${API_BASE}/ubicaciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al actualizar ubicación');
    return json;
  },

  async eliminarUbicacion(id) {
    const res = await fetch(`${API_BASE}/ubicaciones/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.message || 'Error al eliminar ubicación');
    }
    return true;
  },

  // Relaciones Usuario - Hobbies
  async getHobbiesDeUsuario(usuarioId) {
    const res = await fetch(`${API_BASE}/usuarios/${usuarioId}/hobbies`);
    if (!res.ok) throw new Error('Error al obtener hobbies del usuario');
    return res.json();
  },

  async asociarHobbie(usuarioId, hobbieId) {
    const res = await fetch(`${API_BASE}/usuarios/${usuarioId}/hobbies/${hobbieId}`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al asociar hobbie');
    return json;
  },

  async desasociarHobbie(usuarioId, hobbieId) {
    const res = await fetch(`${API_BASE}/usuarios/${usuarioId}/hobbies/${hobbieId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al desasociar hobbie');
    return true;
  },
};
