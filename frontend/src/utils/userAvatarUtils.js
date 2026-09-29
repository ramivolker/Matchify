// Utilidades para fotos y avatares de perfil en Matchify

// Fotos de perfil curadas (Unsplash optimizadas) para dar vida a los usuarios de la demo
export const DEMO_USER_AVATARS = {
  // Sofía Martínez
  2: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  // Mateo González
  3: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  // Valentina Rossi
  4: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  // Lucas Benítez
  6: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  // Camila Duarte
  7: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  // Mateo Romero
  8: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
  // Lucía Fernández
  9: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  // Tomás Herrera
  10: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  // Sofía Bianchi
  11: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  // Bruno Silva
  12: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  // Valentina Vega
  13: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
  // Julián Castro
  14: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  // Camila Méndez
  15: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80',
  // Nicolás Paz
  16: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=400&q=80',
  // Florencia Ríos
  17: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80',
  // Agustín Morales
  18: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
  // Paula Navarro
  19: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
  // Federico Soria
  20: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80',
  // Martina Ibarra
  21: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=400&q=80',
  // Diego Acuña
  22: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=400&q=80',
  // Victoria Luna
  23: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  // Lautaro Benítez
  24: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?auto=format&fit=crop&w=400&q=80',
  // Carolina Campos
  25: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
};

// Preset de avatares modernos listos para elegir
export const AVATAR_PRESETS = [
  {
    id: 'p1',
    name: 'Retrato Urbano 1',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p2',
    name: 'Retrato Urbano 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p3',
    name: 'Creativa Neon',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p4',
    name: 'Sonrisa & Sol',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p5',
    name: 'Estilo Fresh',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p6',
    name: 'Cámara & Viaje',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p7',
    name: 'Natural & Chill',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p8',
    name: 'Minimal Dark',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p9',
    name: 'Golden Hour',
    url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p10',
    name: 'Vibra Nocturna',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p11',
    name: 'Ilustración 3D Alex',
    url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=ff2a6d',
  },
  {
    id: 'p12',
    name: 'Ilustración 3D Sofia',
    url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sofia&backgroundColor=00f5d4',
  },
];

const STORAGE_PREFIX = 'matchify_user_avatar_';

/**
 * Obtiene la URL del avatar de un usuario con resolución escalonada:
 * 1. user.avatar (si viene de backend)
 * 2. localStorage personalizado
 * 3. Foto predefinida de la demo por ID
 * 4. null (usará iniciales como fallback)
 */
export const getUserAvatar = (user) => {
  if (!user) return null;

  // 1. Si el objeto usuario ya tiene un avatar explícito
  if (user.avatar && typeof user.avatar === 'string' && user.avatar.trim()) {
    return user.avatar.trim();
  }

  // 2. Si hay avatar guardado localmente para este usuario
  if (user.id) {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${user.id}`);
      if (stored) {
        if (stored === '__initials__') return null; // El usuario prefirió explícitamente iniciales
        return stored;
      }
    } catch (e) {
      // Ignorar error de acceso a localStorage
    }
  }

  // 3. Avatar de demo asignado por ID de usuario
  if (user.id && DEMO_USER_AVATARS[user.id]) {
    return DEMO_USER_AVATARS[user.id];
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
    // Disparar evento para que otros componentes escuchen el cambio si es necesario
    window.dispatchEvent(new CustomEvent('matchify_avatar_updated', { detail: { userId, avatarUrl } }));
  } catch (e) {
    console.error('Error al guardar avatar:', e);
  }
};
