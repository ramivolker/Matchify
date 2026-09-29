require('dotenv').config();

const hobbies = [
  { nombre: 'Programación', emoji: '💻' },
  { nombre: 'Videojuegos', emoji: '🎮' },
  { nombre: 'Gimnasio', emoji: '🏋️' },
  { nombre: 'Fútbol', emoji: '⚽' },
  { nombre: 'Running', emoji: '🏃' },
  { nombre: 'Ciclismo', emoji: '🚴' },
  { nombre: 'Música', emoji: '🎵' },
  { nombre: 'Cine', emoji: '🍿' },
  { nombre: 'Series', emoji: '📺' },
  { nombre: 'Lectura', emoji: '📚' },
  { nombre: 'Fotografía', emoji: '📸' },
  { nombre: 'Cocina', emoji: '🍳' },
  { nombre: 'Viajes', emoji: '✈️' },
  { nombre: 'Pádel', emoji: '🎾' },
  { nombre: 'Tenis', emoji: '🎾' },
  { nombre: 'Básquet', emoji: '🏀' },
  { nombre: 'Natación', emoji: '🏊' },
  { nombre: 'Tecnología', emoji: '📱' },
  { nombre: 'Arte', emoji: '🎨' },
  { nombre: 'Mascotas', emoji: '🐾' },
];

// Puntos urbanos aproximados; las distancias del endpoint son en línea recta.
const ubicaciones = [
  ['Rosario', 'Santa Fe', -32.9468, -60.6393],
  ['Funes', 'Santa Fe', -32.923, -60.812],
  ['Roldán', 'Santa Fe', -32.898, -60.906],
  ['Granadero Baigorria', 'Santa Fe', -32.861, -60.706],
  ['Villa Gobernador Gálvez', 'Santa Fe', -33.022, -60.634],
  ['San Lorenzo', 'Santa Fe', -32.746, -60.735],
  ['Pérez', 'Santa Fe', -32.998, -60.768],
  ['San Nicolás de los Arroyos', 'Buenos Aires', -33.3358, -60.2252],
  ['Ramallo', 'Buenos Aires', -33.485, -60.007],
].map(([ciudad, provincia, latitud, longitud]) => ({
  ciudad, provincia, pais: 'Argentina', latitud, longitud,
}));

const tipos = ['Estándar', 'Premium'];

// Fechas fijas: los escenarios de edad están documentados para septiembre de 2026.
// Las claves de email son estables y no dependen de los IDs de la base.
const usuarios = [
  ['Mateo', 'Ferrero', 'mateo.ferrero', '1997-04-12', 'Rosario', 'Estándar', true, [30, 25, 35], ['Programación', 'Videojuegos', 'Running', 'Música'], 'Trabajo como desarrollador y salgo a correr por la costanera. Me sumo a un café y una buena charla.'],
  ['Lucía', 'Benítez', 'lucia.benitez', '1998-08-23', 'Rosario', 'Premium', true, [20, 26, 36], ['Fotografía', 'Cine', 'Viajes'], 'Soy diseñadora y siempre llevo la cámara en la mochila. Los domingos me gusta descubrir cafés de barrio.'],
  ['Tomás', 'Acosta', 'tomas.acosta', '1996-02-17', 'San Nicolás de los Arroyos', 'Estándar', true, [80, 24, 36], ['Fútbol', 'Música', 'Cocina'], 'Doy clases de música y juego al fútbol con amigos. Estoy aprendiendo a hacer pasta casera.'],
  ['Sofía', 'Molina', 'sofia.molina', '1999-06-09', 'Funes', 'Estándar', true, [30, 25, 34], ['Pádel', 'Mascotas', 'Lectura', 'Series'], 'Veterinaria, fan de las novelas policiales y del pádel después del trabajo. Convivo con dos perros rescatados.'],
  ['Bruno', 'Sosa', 'bruno.sosa', '2006-01-20', 'Rosario', 'Estándar', true, [15, 18, 24], ['Videojuegos', 'Básquet', 'Tecnología'], 'Estudio sistemas y juego al básquet en el club. Busco gente para compartir juegos y recitales.'],
  ['Valentina', 'Ríos', 'valentina.rios', '1995-11-04', 'Roldán', 'Premium', true, [45, 27, 38], ['Ciclismo', 'Cocina', 'Viajes', 'Fotografía'], 'Los sábados salgo en bici y después cocino para amigos. Mi próximo proyecto es recorrer el sur.'],
  ['Julián', 'Pereyra', 'julian.pereyra', '1994-03-15', 'Granadero Baigorria', 'Estándar', true, [25, 25, 35], ['Natación', 'Cine'], 'Trabajo en un laboratorio y nado para despejarme. Siempre acepto una recomendación de película.'],
  ['Camila', 'Duarte', 'camila.duarte', '2000-07-28', 'Villa Gobernador Gálvez', 'Estándar', true, [20, 24, 32], ['Arte', 'Música', 'Lectura'], 'Soy ilustradora y disfruto las ferias y los recitales chicos. Me gusta dibujar al aire libre.'],
  ['Nicolás', 'Vega', 'nicolas.vega', '1993-12-02', 'San Lorenzo', 'Premium', true, [50, 28, 40], ['Gimnasio', 'Tenis', 'Tecnología'], 'Ingeniero durante la semana, tenista amateur los fines de semana. Me encantan las sobremesas largas.'],
  ['Florencia', 'Castro', 'florencia.castro', '1997-09-08', 'Pérez', 'Estándar', true, [20, 25, 35], ['Running', 'Mascotas', 'Series'], 'Soy docente y corro con un grupo del barrio. Mi plan tranquilo es una serie con mi gata al lado.'],
  ['Agustín', 'Medina', 'agustin.medina', '1998-05-31', 'Ramallo', 'Estándar', true, [100, 24, 34], ['Música', 'Cocina'], 'Disfruto caminar junto al río y cocinar al disco para amigos. Trabajo en un taller familiar.'],
  ['Paula', 'Herrera', 'paula.herrera', '1982-10-19', 'Funes', 'Premium', true, [40, 38, 50], ['Tenis', 'Lectura', 'Viajes'], 'Arquitecta y lectora de novelas históricas. Me gusta organizar escapadas cortas y jugar dobles.'],
  ['Federico', 'Navarro', 'federico.navarro', '1996-08-06', 'Rosario', 'Estándar', false, [30, 25, 35], ['Programación', 'Cine', 'Gimnasio'], 'Desarrollo aplicaciones y entreno temprano. Los viernes suelo elegir cine y pizza con amigos.'],
  ['Martina', 'Cabrera', 'martina.cabrera', '2007-03-11', 'Granadero Baigorria', 'Estándar', true, [15, 18, 23], ['Arte', 'Fotografía', 'Música'], 'Estudio diseño y estoy armando mi primer portfolio. Me gustan las muestras y los paseos con cámara.'],
  ['Diego', 'Suárez', 'diego.suarez', '1980-06-24', 'San Nicolás de los Arroyos', 'Premium', true, [60, 38, 52], ['Ciclismo', 'Natación', 'Cocina'], 'Soy técnico electricista y me gusta moverme en bici. Cocino pan los domingos y siempre hago de más.'],
  ['Victoria', 'Ledesma', 'victoria.ledesma', '1992-01-30', 'Rosario', 'Premium', true, [10, 30, 40], ['Lectura', 'Cine', 'Arte', 'Música', 'Viajes', 'Cocina'], 'Traductora, curiosa por los idiomas y el cine. Me encanta probar una receta nueva con buena música.'],
  ['Lautaro', 'Silva', 'lautaro.silva', '2002-12-13', 'Roldán', 'Estándar', true, [35, 20, 28], ['Fútbol', 'Videojuegos', 'Gimnasio'], 'Estudio educación física y entreno un equipo infantil. En casa no falta una partida con amigos.'],
  ['Carolina', 'Paz', 'carolina.paz', '1995-04-05', 'Ramallo', 'Premium', true, [120, 27, 38], ['Fotografía', 'Mascotas', 'Running', 'Series'], 'Trabajo en turismo y salgo a correr cerca del río. Me gusta conocer lugares y viajar con mi perro.'],
].map(([nombre, apellido, clave, nacimiento, ciudad, tipo, activo, preferencia, intereses, biografia]) => ({
  nombre, apellido, email: `${clave}@seed.matchify.test`,
  fechaNacimiento: new Date(`${nacimiento}T00:00:00.000Z`),
  ciudad, tipo, activo, biografia, intereses,
  preferencia: { distanciaMaxKm: preferencia[0], edadMinima: preferencia[1], edadMaxima: preferencia[2] },
}));

async function seed(prisma) {
  return prisma.$transaction(async (tx) => {
    const hobbyIds = new Map();
    for (const h of hobbies) {
      const hobbie = await tx.hobbie.upsert({
        where: { nombre: h.nombre },
        update: { emoji: h.emoji },
        create: { nombre: h.nombre, emoji: h.emoji },
      });
      hobbyIds.set(h.nombre, hobbie.id);
    }

    const tipoIds = new Map();
    for (const nombre of tipos) {
      const tipo = await tx.tipoUsuario.upsert({ where: { nombre }, update: {}, create: { nombre } });
      tipoIds.set(nombre, tipo.id);
    }

    const ubicacionIds = new Map();
    for (const datos of ubicaciones) {
      const { ciudad, provincia, pais } = datos;
      // No existe @@unique para ciudades: reutilizar la primera coincidencia estable.
      const existente = await tx.ubicacion.findFirst({
        where: { ciudad, provincia, pais }, orderBy: { id: 'asc' },
      });
      const ubicacion = existente
        ? await tx.ubicacion.update({ where: { id: existente.id }, data: datos })
        : await tx.ubicacion.create({ data: datos });
      ubicacionIds.set(ciudad, ubicacion.id);
    }

    const resultado = [];
    for (const perfil of usuarios) {
      const { ciudad, tipo, intereses, preferencia, ...datos } = perfil;
      const data = { ...datos, ubicacionId: ubicacionIds.get(ciudad), tipoUsuarioId: tipoIds.get(tipo) };
      const usuario = await tx.usuario.upsert({ where: { email: datos.email }, update: data, create: data });
      await tx.preferencia.upsert({
        where: { usuarioId: usuario.id }, update: preferencia,
        create: { usuarioId: usuario.id, ...preferencia },
      });

      // Sincronizar únicamente los hobbies de estos perfiles de prueba.
      const ids = intereses.map((nombre) => {
        if (!hobbyIds.has(nombre)) throw new Error(`Hobbie desconocido: ${nombre}`);
        return hobbyIds.get(nombre);
      });
      await tx.usuarioHobbie.deleteMany({ where: { usuarioId: usuario.id, hobbieId: { notIn: ids } } });
      for (const hobbieId of ids) {
        const relacion = { usuarioId: usuario.id, hobbieId };
        await tx.usuarioHobbie.upsert({ where: { usuarioId_hobbieId: relacion }, update: {}, create: relacion });
      }
      resultado.push({ id: usuario.id, nombre: `${datos.nombre} ${datos.apellido}`, email: datos.email, ciudad, activo: datos.activo });
    }
    return resultado;
  }, { timeout: 60000, isolationLevel: 'Serializable' });
}

if (require.main === module) {
  const prisma = require('../src/config/prisma');
  seed(prisma)
    .then((perfiles) => {
      console.table(perfiles);
      console.log('Seed completo: 20 hobbies, 9 ubicaciones y 18 perfiles. Likes y matches conservados sin cambios.');
      console.log(`Referencia: GET /api/usuarios/${perfiles[0].id}/candidatos (Mateo Ferrero)`);
    })
    .catch((error) => { console.error(error); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}

module.exports = { seed, hobbies, ubicaciones, usuarios };
