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

  if (data.biografia !== undefined && data.biografia !== null) {
    payload.biografia = String(data.biografia).trim() || null;
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
      descripcion: data.descripcion ? String(data.descripcion).trim() : null,
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
      descripcion: data.descripcion ? String(data.descripcion).trim() : null,
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

  // Carga de datos de prueba iniciales (Seeds) para evaluación rápida
  async seedInitialData() {
    try {
      // 1. Ubicaciones iniciales
      const u1 = await this.crearUbicacion({ ciudad: 'Rosario', provincia: 'Santa Fe', pais: 'Argentina', latitud: -32.9468, longitud: -60.6393 }).catch(() => null);
      const u2 = await this.crearUbicacion({ ciudad: 'Córdoba', provincia: 'Córdoba', pais: 'Argentina', latitud: -31.4201, longitud: -64.1888 }).catch(() => null);
      const u3 = await this.crearUbicacion({ ciudad: 'Buenos Aires', provincia: 'CABA', pais: 'Argentina', latitud: -34.6037, longitud: -58.3816 }).catch(() => null);

      // 2. Hobbies iniciales
      const h1 = await this.crearHobbie({ nombre: 'Fotografía', descripcion: 'Capturar momentos y retratos urbanos' }).catch(() => null);
      const h2 = await this.crearHobbie({ nombre: 'Fútbol', descripcion: 'Partidos con amigos y torneos' }).catch(() => null);
      const h3 = await this.crearHobbie({ nombre: 'Música en vivo', descripcion: 'Conciertos, festivales y tocar instrumentos' }).catch(() => null);
      const h4 = await this.crearHobbie({ nombre: 'Gastronomía & Café', descripcion: 'Cocinar recetas y descubrir cafeterías' }).catch(() => null);
      const h5 = await this.crearHobbie({ nombre: 'Videojuegos', descripcion: 'Gaming, consolas y partidas cooperativas' }).catch(() => null);

      const ubicacionId = u1?.id || 1;

      // 3. Usuarios de prueba
      const usr1 = await this.crearUsuario({
        nombre: 'Sofía',
        apellido: 'Martínez',
        email: 'sofia@matchify.com',
        fechaNacimiento: '1998-05-14',
        biografia: 'Diseñadora gráfica. Me encanta sacar fotos analógicas y los fines de semana ir a recitales.',
        ubicacionId,
        activo: true,
      }).catch(() => null);

      const usr2 = await this.crearUsuario({
        nombre: 'Mateo',
        apellido: 'González',
        email: 'mateo@matchify.com',
        fechaNacimiento: '1996-11-22',
        biografia: 'Ingeniero y aficionado a la cocina. Siempre listo para un partidito de fútbol o probar un nuevo café.',
        ubicacionId: u2?.id || ubicacionId,
        activo: true,
      }).catch(() => null);

      const usr3 = await this.crearUsuario({
        nombre: 'Valentina',
        apellido: 'López',
        email: 'valentina@matchify.com',
        fechaNacimiento: '2001-03-30',
        biografia: 'Estudiante de cine. Fanática de los videojuegos, el senderismo y las buenas charlas.',
        ubicacionId: u3?.id || ubicacionId,
        activo: true,
      }).catch(() => null);

      // 4. Vincular algunos hobbies
      if (usr1?.id && h1?.id) await this.asociarHobbie(usr1.id, h1.id).catch(() => {});
      if (usr1?.id && h3?.id) await this.asociarHobbie(usr1.id, h3.id).catch(() => {});
      if (usr2?.id && h2?.id) await this.asociarHobbie(usr2.id, h2.id).catch(() => {});
      if (usr2?.id && h4?.id) await this.asociarHobbie(usr2.id, h4.id).catch(() => {});
      if (usr3?.id && h3?.id) await this.asociarHobbie(usr3.id, h3.id).catch(() => {});
      if (usr3?.id && h5?.id) await this.asociarHobbie(usr3.id, h5.id).catch(() => {});

      return true;
    } catch {
      return false;
    }
  },
};
