// Utilidades para fotos y avatares de perfil en Matchify

// Fotos de perfil curadas (Unsplash) asignadas estrictamente según el género e identidad de cada usuario
export const DEMO_USER_AVATARS = {
  // 1: Mateo Ferrero (MASCULINO)
  1: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  // 2: Lucía Benítez (FEMENINO)
  2: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  // 3: Tomás Acosta (NO_BINARIO)
  3: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
  // 4: Sofía Molina (OTRO - Femenino/Neutro)
  4: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
  // 5: Bruno Sosa (MASCULINO)
  5: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  // 6: Valentina Ríos (FEMENINO - ¡Foto de mujer!)
  6: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  // 7: Julián Pereyra (OTRO - Masculino)
  7: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
  // 8: Camila Duarte (NO_BINARIO - Femenino)
  8: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  // 9: Nicolás Vega (MASCULINO)
  9: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
  // 10: Florencia Castro (FEMENINO)
  10: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
  // 11: Agustín Medina (NO_BINARIO)
  11: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=800&q=80',
  // 12: Paula Herrera (OTRO - Femenino)
  12: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=800&q=80',
  // 13: Federico Navarro (MASCULINO)
  13: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80',
  // 14: Martina Cabrera (FEMENINO)
  14: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
  // 15: Diego Suárez (OTRO - Masculino)
  15: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=800&q=80',
  // 16: Victoria Ledesma (NO_BINARIO - Femenino)
  16: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
  // 17: Lautaro Silva (MASCULINO)
  17: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?auto=format&fit=crop&w=800&q=80',
  // 18: Carolina Paz (FEMENINO)
  18: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
};

// Galería completa de fotos de la demo (2-3 fotos por usuario para navegación instantánea)
export const DEMO_USER_PHOTOS = {
  1: [
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
  ],
  2: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  ],
  3: [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  ],
  4: [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  ],
  5: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
  ],
  6: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  ],
  7: [
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80',
  ],
  8: [
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
  ],
  9: [
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  ],
  10: [
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  ],
  11: [
    'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
  ],
  12: [
    'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
  ],
  13: [
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
  ],
  14: [
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  ],
  15: [
    'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  ],
  16: [
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
  ],
  17: [
    'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  ],
  18: [
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  ],
};

// Fallbacks genéricos según género
export const GENDER_FALLBACK_AVATARS = {
  FEMENINO: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  MASCULINO: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  NO_BINARIO: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  OTRO: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
};

// Preset de avatares modernos categorizados
export const AVATAR_PRESETS = [
  // Femeninos
  {
    id: 'f1',
    name: 'Sofía - Sonrisa Natural',
    genero: 'FEMENINO',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'f2',
    name: 'Valentina - Estilo Urbano',
    genero: 'FEMENINO',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'f3',
    name: 'Lucía - Creativa & Fresh',
    genero: 'FEMENINO',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'f4',
    name: 'Carolina - Golden Hour',
    genero: 'FEMENINO',
    url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'f5',
    name: 'Florencia - Cálida & Chill',
    genero: 'FEMENINO',
    url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
  },
  // Masculinos
  {
    id: 'm1',
    name: 'Bruno - Sonrisa Amigable',
    genero: 'MASCULINO',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'm2',
    name: 'Mateo - Retrato Estudio',
    genero: 'MASCULINO',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'm3',
    name: 'Nicolás - Casual Deportivo',
    genero: 'MASCULINO',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'm4',
    name: 'Lautaro - Vibra Libre',
    genero: 'MASCULINO',
    url: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'm5',
    name: 'Federico - Moderno & Tech',
    genero: 'MASCULINO',
    url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80',
  },
  // Ilustraciones / Neutros
  {
    id: 'p11',
    name: 'Ilustración 3D Alex',
    genero: 'NO_BINARIO',
    url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=ff2a6d',
  },
  {
    id: 'p12',
    name: 'Ilustración 3D Sofia',
    genero: 'FEMENINO',
    url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sofia&backgroundColor=00f5d4',
  },
];

const STORAGE_PREFIX = 'matchify_user_avatar_';

/**
 * Obtiene la lista completa de fotos de un usuario (para carrusel y navegación)
 */
export const getUserPhotos = (user) => {
  if (!user) return [];

  // 1. Fotos cargadas desde el backend (relación Usuario.fotos)
  if (Array.isArray(user.fotos) && user.fotos.length > 0) {
    const urls = user.fotos
      .map((f) => (typeof f === 'string' ? f : f?.url))
      .filter((u) => u && typeof u === 'string' && u.trim().length > 0);
    if (urls.length > 0) return urls;
  }

  // 2. Fotos de la demo por ID de usuario
  if (user.id && DEMO_USER_PHOTOS[user.id] && DEMO_USER_PHOTOS[user.id].length > 0) {
    return DEMO_USER_PHOTOS[user.id];
  }

  // 3. Avatar individual como foto única
  const avatar = getUserAvatar(user);
  if (avatar) return [avatar];

  return [];
};

/**
 * Obtiene la URL del avatar principal de un usuario:
 * 1. Primera foto en user.fotos (si existe)
 * 2. user.avatar explícito
 * 3. localStorage personalizado
 * 4. Foto de demo por ID (coincidente con su género)
 * 5. Fallback por género
 */
export const getUserAvatar = (user) => {
  if (!user) return null;

  // 1. Primera foto del array de fotos
  if (Array.isArray(user.fotos) && user.fotos.length > 0) {
    const first = user.fotos[0];
    const url = typeof first === 'string' ? first : first?.url;
    if (url && typeof url === 'string' && url.trim()) {
      return url.trim();
    }
  }

  // 2. Campo avatar o foto explícito
  if (user.avatar && typeof user.avatar === 'string' && user.avatar.trim()) {
    return user.avatar.trim();
  }
  if (user.foto && typeof user.foto === 'string' && user.foto.trim()) {
    return user.foto.trim();
  }

  // 3. Avatar guardado localmente para este usuario
  if (user.id) {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${user.id}`);
      if (stored) {
        if (stored === '__initials__') return null; // El usuario prefirió iniciales
        return stored;
      }
    } catch (e) {
      // Ignorar error de acceso a localStorage
    }
  }

  // 4. Avatar de demo asignado por ID de usuario (mapeo con género verificado)
  if (user.id && DEMO_USER_AVATARS[user.id]) {
    return DEMO_USER_AVATARS[user.id];
  }

  // 5. Fallback automático según el género del perfil
  if (user.genero && GENDER_FALLBACK_AVATARS[user.genero]) {
    return GENDER_FALLBACK_AVATARS[user.genero];
  }

  return null;
};

/**
 * Guarda o actualiza el avatar de un usuario en localStorage y dispara evento de sincronización
 */
export const saveUserAvatar = (userId, avatarUrl) => {
  if (!userId) return;
  try {
    if (!avatarUrl) {
      localStorage.setItem(`${STORAGE_PREFIX}${userId}`, '__initials__');
    } else {
      localStorage.setItem(`${STORAGE_PREFIX}${userId}`, avatarUrl);
    }
    window.dispatchEvent(
      new CustomEvent('matchify_avatar_updated', { detail: { userId, avatarUrl } })
    );
  } catch (e) {
    console.error('Error al guardar avatar:', e);
  }
};
