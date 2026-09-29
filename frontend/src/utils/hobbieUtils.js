export const DEFAULT_HOBBIE_EMOJIS = {
  'Fotografía': '📸',
  'Fútbol': '⚽',
  'Música en vivo': '🎸',
  'Gastronomía & Café': '☕',
  'Videojuegos': '🎮',
  'Trekking & Montaña': '🏔️',
  'Cine & Series': '🎬',
  'Lectura': '📚',
  'Yoga & Bienestar': '🧘',
  'Programación': '💻',
  'Gimnasio': '🏋️',
  'Running': '🏃',
  'Ciclismo': '🚴',
  'Música': '🎵',
  'Cine': '🍿',
  'Series': '📺',
  'Cocina': '🍳',
  'Viajes': '✈️',
  'Pádel': '🎾',
  'Tenis': '🎾',
  'Básquet': '🏀',
  'Natación': '🏊',
  'Tecnología': '📱',
  'Arte': '🎨',
  'Mascotas': '🐾',
};

export const getHobbieEmoji = (hobbie) => {
  if (!hobbie) return '🎯';
  if (typeof hobbie === 'string') {
    return DEFAULT_HOBBIE_EMOJIS[hobbie] || '🎯';
  }
  if (hobbie.emoji && typeof hobbie.emoji === 'string' && hobbie.emoji.trim()) {
    return hobbie.emoji.trim();
  }
  if (hobbie.nombre && DEFAULT_HOBBIE_EMOJIS[hobbie.nombre]) {
    return DEFAULT_HOBBIE_EMOJIS[hobbie.nombre];
  }
  return '🎯';
};
