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

// 20 Famosos reconocidos mundialmente: 10 Mujeres y 10 Hombres
const usuarios = [
  // ==================== 👩 MUJERES (10) ====================
  ['Taylor', 'Swift', 'taylor.swift', '1989-12-13', 'Rosario', 'Premium', true, [50, 28, 45], ['Música', 'Lectura', 'Cocina', 'Mascotas'], 'Cantante y compositora. Amante de la buena música, las noches tranquilas cocinando y escribir historias en canciones.', 'FEMENINO', ['MASCULINO']],
  ['Beyoncé', 'Knowles', 'beyonce.knowles', '1981-09-04', 'Rosario', 'Premium', true, [60, 35, 55], ['Música', 'Arte', 'Gimnasio', 'Viajes'], 'Cantante, bailarina y empresaria. Pasión, energía y disciplina en el escenario y en la vida.', 'FEMENINO', ['MASCULINO']],
  ['Selena', 'Gomez', 'selena.gomez', '1992-07-22', 'Funes', 'Estándar', true, [40, 26, 40], ['Cocina', 'Música', 'Cine', 'Mascotas'], 'Actriz, cantante y empresaria (fundadora de Rare Beauty). Me gusta cocinar cosas ricas y rodearme de gente auténtica.', 'FEMENINO', ['MASCULINO']],
  ['Zendaya', 'Coleman', 'zendaya', '1996-09-01', 'Rosario', 'Premium', true, [30, 24, 36], ['Cine', 'Arte', 'Fotografía', 'Mascotas'], 'Actriz y referente de moda (Euphoria, Dune, Spider-Man). Disfruto el buen cine, la moda y una charla honesta.', 'FEMENINO', ['MASCULINO']],
  ['Robyn', 'Rihanna', 'rihanna', '1988-02-20', 'San Lorenzo', 'Premium', true, [50, 30, 48], ['Música', 'Arte', 'Viajes', 'Tecnología'], 'Cantante y empresaria (fundadora de Fenty Beauty). Auténtica, decidida y con ganas de pasarla bien.', 'FEMENINO', ['MASCULINO']],
  ['Scarlett', 'Johansson', 'scarlett.johansson', '1984-11-22', 'Roldán', 'Premium', true, [45, 32, 50], ['Cine', 'Lectura', 'Arte', 'Viajes'], 'Actriz reconocida por mi papel en el UCM y Jurassic World. Apasionada del buen cine y una rica cena con amigos.', 'FEMENINO', ['MASCULINO']],
  ['Sabrina', 'Carpenter', 'sabrina.carpenter', '1999-05-11', 'Funes', 'Estándar', true, [35, 22, 35], ['Música', 'Cine', 'Fotografía', 'Viajes'], 'Cantante pop y actriz. Con mucho humor, café en mano y siempre con una melodía pegadiza en la cabeza.', 'FEMENINO', ['MASCULINO']],
  ['Shakira', 'Mebarak', 'shakira', '1977-02-02', 'Rosario', 'Premium', true, [70, 35, 55], ['Música', 'Tenis', 'Natación', 'Ciclismo'], 'Cantante y compositora. La música y el movimiento son mi vida. Fan de los deportes al aire libre y las buenas vibras.', 'FEMENINO', ['MASCULINO']],
  ['Margot', 'Robbie', 'margot.robbie', '1990-07-02', 'Granadero Baigorria', 'Premium', true, [40, 28, 45], ['Cine', 'Natación', 'Viajes', 'Fotografía'], 'Actriz y productora (Barbie, El lobo de Wall Street). Aventurera, amante de la playa, los viajes y el cine.', 'FEMENINO', ['MASCULINO']],
  ['Anya', 'Taylor-Joy', 'anya.taylorjoy', '1996-04-16', 'Rosario', 'Estándar', true, [30, 25, 38], ['Cine', 'Lectura', 'Arte', 'Series'], 'Actriz (Gambito de Dama, Furiosa). Con acento argento, fanática de los libros, el mate y las buenas historias.', 'FEMENINO', ['MASCULINO']],

  // ==================== 👨 HOMBRES (10) ====================
  ['Lionel', 'Messi', 'lionel.messi', '1987-06-24', 'Rosario', 'Premium', true, [40, 28, 42], ['Fútbol', 'Gimnasio', 'Mascotas', 'Videojuegos'], 'Futbolista rosarino. Mate, familia, fútbol y tranquilidad. Campeón del mundo disfrutando cada momento.', 'MASCULINO', ['FEMENINO']],
  ['Cristiano', 'Ronaldo', 'cristiano.ronaldo', '1985-02-05', 'Rosario', 'Premium', true, [60, 25, 45], ['Fútbol', 'Gimnasio', 'Natación', 'Running'], 'Futbolista profesional. Dedicación total, superación diaria y mentalidad ganadora. SIUUU.', 'MASCULINO', ['FEMENINO']],
  ['Timothée', 'Chalamet', 'timothee.chalamet', '1995-12-27', 'Funes', 'Estándar', true, [35, 22, 35], ['Cine', 'Arte', 'Lectura', 'Música'], 'Actor protagonista de Dune y Wonka. Amante de la literatura, el cine de autor y la música alternativa.', 'MASCULINO', ['FEMENINO']],
  ['Pedro', 'Pascal', 'pedro.pascal', '1975-04-02', 'San Nicolás de los Arroyos', 'Premium', true, [80, 30, 55], ['Cine', 'Series', 'Viajes', 'Cocina'], 'Actor (The Last of Us, The Mandalorian). Con buena onda, café cargado y siempre listo para una buena charla.', 'MASCULINO', ['FEMENINO']],
  ['Dwayne', 'Johnson', 'dwayne.johnson', '1972-05-02', 'San Lorenzo', 'Premium', true, [50, 35, 58], ['Gimnasio', 'Cocina', 'Cine', 'Tecnología'], 'Actor y ex-luchador profesional (The Rock). El trabajo duro, la sonrisa y la energía positiva nunca se negocian.', 'MASCULINO', ['FEMENINO']],
  ['Benito', 'Martínez', 'bad.bunny', '1994-03-10', 'Rosario', 'Estándar', true, [40, 23, 36], ['Música', 'Arte', 'Básquet', 'Videojuegos'], 'Bad Bunny: cantante y compositor. Hago lo que me nace del corazón. Buena vibra, básquet y música siempre.', 'MASCULINO', ['FEMENINO']],
  ['Keanu', 'Reeves', 'keanu.reeves', '1964-09-02', 'Ramallo', 'Premium', true, [100, 35, 60], ['Música', 'Cine', 'Ciclismo', 'Lectura'], 'Actor (John Wick, The Matrix). Perfil tranquilo, fanático de las motos, la música y las conversaciones sinceras.', 'MASCULINO', ['FEMENINO']],
  ['Cillian', 'Murphy', 'cillian.murphy', '1976-05-25', 'Pérez', 'Estándar', true, [30, 32, 52], ['Cine', 'Música', 'Lectura', 'Running'], 'Actor ganador del Óscar por Oppenheimer. Disfruto la tranquilidad, la música en vinilo y un buen libro.', 'MASCULINO', ['FEMENINO']],
  ['Justin', 'Bieber', 'justin.bieber', '1994-03-01', 'Roldán', 'Estándar', true, [45, 24, 36], ['Música', 'Básquet', 'Gimnasio', 'Ciclismo'], 'Cantante pop. Dedicado a la música, el crecimiento personal y disfrutar los momentos simples de la vida.', 'MASCULINO', ['FEMENINO']],
  ['Leonardo', 'DiCaprio', 'leonardo.dicaprio', '1974-11-11', 'Rosario', 'Premium', true, [50, 25, 45], ['Cine', 'Viajes', 'Arte', 'Fotografía'], 'Actor y activista ambiental. Apasionado por el cine, la conservación del planeta y explorar el mundo.', 'MASCULINO', ['FEMENINO']],
].map(([nombre, apellido, clave, nacimiento, ciudad, tipo, activo, preferencia, intereses, biografia, genero, generos]) => ({
  nombre, apellido, email: `${clave}@seed.matchify.test`,
  fechaNacimiento: new Date(`${nacimiento}T00:00:00.000Z`),
  ciudad, tipo, activo, biografia, intereses, genero,
  preferencia: { generos, distanciaMaxKm: preferencia[0], edadMinima: preferencia[1], edadMaxima: preferencia[2] },
}));

// Fotos reales para cada famoso (mínimo 3 fotos en alta resolución por persona)
const fotosPorClave = {
  'taylor.swift': [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png/960px-Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/Taylor_Swift_at_Yahoo_2007_%28cropped%29.jpg/960px-Taylor_Swift_at_Yahoo_2007_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://upload.wikimedia.org/wikipedia/commons/e/e8/TaylorSwiftApr09.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  ],
  'beyonce.knowles': [
    'https://upload.wikimedia.org/wikipedia/commons/b/b7/Beyonc%C3%A9_-_Tottenham_Hotspur_Stadium_-_1st_June_2023_%2810_of_118%29_%2852946364598%29_%28best_crop%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Beyonce_Knowles_at_age_19_%28cropped%29.jpeg/960px-Beyonce_Knowles_at_age_19_%28cropped%29.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://upload.wikimedia.org/wikipedia/commons/2/24/Beyonc%C3%A9_Army.mil_%28cropped%29_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  ],
  'selena.gomez': [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Selena_Gomez_at_the_2024_Toronto_International_Film_Festival_10_%28cropped%29.jpg/960px-Selena_Gomez_at_the_2024_Toronto_International_Film_Festival_10_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://upload.wikimedia.org/wikipedia/commons/e/ef/Selena_Gomez_2009.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Selena_Gomez_December_2010_2.jpg/960px-Selena_Gomez_December_2010_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  ],
  'zendaya': [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Zendaya-byPhilipRomano.jpg/960px-Zendaya-byPhilipRomano.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Zendaya_by_Gage_Skidmore.jpg/960px-Zendaya_by_Gage_Skidmore.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/Zendaya_-_2019_by_Glenn_Francis.jpg/960px-Zendaya_-_2019_by_Glenn_Francis.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  ],
  'rihanna': [
    'https://upload.wikimedia.org/wikipedia/commons/c/c2/Rihanna_Fenty_2018.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
    'https://upload.wikimedia.org/wikipedia/commons/6/66/RihannaJingle_Ball_cropped.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Rihanna_2010_cropped.jpg/960px-Rihanna_2010_cropped.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  ],
  'scarlett.johansson': [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Scarlett_Johansson-8588.jpg/960px-Scarlett_Johansson-8588.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://upload.wikimedia.org/wikipedia/commons/d/db/Scarlett_Johansson_2003.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
    'https://upload.wikimedia.org/wikipedia/commons/5/55/Scarlett_Johansson_Cannes_2005.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  ],
  'sabrina.carpenter': [
    'https://upload.wikimedia.org/wikipedia/commons/6/61/Sabrina_Carpenter_-_O2_Arena_2025_-_086_%28cropped_2%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Sabrina_Carpenter_at_California_2_December_2016_%28cropped%29.jpg/960px-Sabrina_Carpenter_at_California_2_December_2016_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://upload.wikimedia.org/wikipedia/commons/6/6d/Sabrina_Carpenter_VMA_2018.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  ],
  'shakira': [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/2023-11-16_Gala_de_los_Latin_Grammy%2C_03_%28cropped%2902.jpg/960px-2023-11-16_Gala_de_los_Latin_Grammy%2C_03_%28cropped%2902.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://upload.wikimedia.org/wikipedia/commons/a/a9/Shakira_in_concert.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Shakira_Rio_06.jpg/960px-Shakira_Rio_06.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  ],
  'margot.robbie': [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/Margot_Robbie_Wuthering_Heights_premiere_%28cropped%29.jpg/960px-Margot_Robbie_Wuthering_Heights_premiere_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/Margot_Robbie_%28cropped%29.jpg/960px-Margot_Robbie_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Margot_Robbie_by_Gage_Skidmore.jpg/960px-Margot_Robbie_by_Gage_Skidmore.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  ],
  'anya.taylorjoy': [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Anya_Taylor-Joy_at_the_2025_Toronto_International_Film_Festival._07_%28cropped%29.jpg/960px-Anya_Taylor-Joy_at_the_2025_Toronto_International_Film_Festival._07_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Anya_Taylor-Joy_by_Gage_Skidmore.jpg/960px-Anya_Taylor-Joy_by_Gage_Skidmore.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Anya_Taylor-Joy_at_the_2024_Cannes_Film_Festival_%28cropped%29.jpg/960px-Anya_Taylor-Joy_at_the_2024_Cannes_Film_Festival_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  ],
  'lionel.messi': [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Leo_Messi_Argentina_v_Egypt_7_July_2026-1.jpg/960px-Leo_Messi_Argentina_v_Egypt_7_July_2026-1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://upload.wikimedia.org/wikipedia/commons/c/c1/Lionel_Messi_20180626.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Leo_messi_barce_2005.jpg/960px-Leo_messi_barce_2005.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  ],
  'cristiano.ronaldo': [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Cristiano_Ronaldo_Croatia_v_Portugal_2_July_2026-075_%28cropped%29.jpg/960px-Cristiano_Ronaldo_Croatia_v_Portugal_2_July_2026-075_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Ronaldo_-_Manchester_United_vs_Chelsea.jpg/960px-Ronaldo_-_Manchester_United_vs_Chelsea.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Cristiano_Ronaldo_and_Andriy_Shevchenko%2C_2007_%28cropped%29.jpg/960px-Cristiano_Ronaldo_and_Andriy_Shevchenko%2C_2007_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  ],
  'timothee.chalamet': [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Timoth%C3%A9e_Chalamet-63482_%28cropped%29.jpg/960px-Timoth%C3%A9e_Chalamet-63482_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Timoth%C3%A9e_Chalamet_Call_Me_By_Your_Name_Press_Conference_Berlinale_2017_%28cropped%29.jpg/960px-Timoth%C3%A9e_Chalamet_Call_Me_By_Your_Name_Press_Conference_Berlinale_2017_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Timoth%C3%A9e_Chalamet_in_2018_%28cropped%29.jpg/960px-Timoth%C3%A9e_Chalamet_in_2018_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  ],
  'pedro.pascal': [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Pedro_Pascal_at_the_2026_New_York_Film_Festival-042.jpg/960px-Pedro_Pascal_at_the_2026_New_York_Film_Festival-042.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Pedro_Pascal_%2814588037218%29.jpg/960px-Pedro_Pascal_%2814588037218%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Pedro_Pascal_%2836124158715%29.jpg/960px-Pedro_Pascal_%2836124158715%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  ],
  'dwayne.johnson': [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/Dwayne_Johnson-1764_%284x5_cropped_with_moderate_headroom%29.jpg/960px-Dwayne_Johnson-1764_%284x5_cropped_with_moderate_headroom%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/Dwayne_Johnson_at_the_2009_Tribeca_Film_Festival.jpg/960px-Dwayne_Johnson_at_the_2009_Tribeca_Film_Festival.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Dwayne_Johnson_2014.jpg/960px-Dwayne_Johnson_2014.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  ],
  'bad.bunny': [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Bad_Bunny_2019_by_Glenn_Francis_%28cropped%29.jpg/960px-Bad_Bunny_2019_by_Glenn_Francis_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://upload.wikimedia.org/wikipedia/commons/d/d2/Bad_Bunny_2017_-_2.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Bad_Bunny_Performs.jpg/960px-Bad_Bunny_Performs.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  ],
  'keanu.reeves': [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Keanu_Reeves_at_TIFF_2025_02_%28Cropped%29.jpg/960px-Keanu_Reeves_at_TIFF_2025_02_%28Cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://upload.wikimedia.org/wikipedia/commons/2/2b/Keanu_reeves_anthony_griffith_%28cropped2%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Keanu_Reeves_%28Berlin_Film_Festival_2009%29_2.jpg/960px-Keanu_Reeves_%28Berlin_Film_Festival_2009%29_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  ],
  'cillian.murphy': [
    'https://upload.wikimedia.org/wikipedia/commons/e/ed/Cillian_Murphy_at_the_London_premier_of_Steve_in_September_2025_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
    'https://upload.wikimedia.org/wikipedia/commons/6/68/Cillianmurphy.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/Cillian_Murphy-2014.jpg/960px-Cillian_Murphy-2014.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  ],
  'justin.bieber': [
    'https://upload.wikimedia.org/wikipedia/commons/6/68/Justin_Bieber_2.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Justin_Bieber_2010_2.jpg/960px-Justin_Bieber_2010_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
    'https://upload.wikimedia.org/wikipedia/commons/7/75/Justin_Bieber_April_2011_3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  ],
  'leonardo.dicaprio': [
    'https://upload.wikimedia.org/wikipedia/commons/2/2d/LeoPTABFI191125-28_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
    'https://upload.wikimedia.org/wikipedia/commons/f/f9/Leonardo_DiCaprio.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
    'https://upload.wikimedia.org/wikipedia/commons/2/25/Leonardo_DiCaprio_2014.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  ],
};

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

    // Limpiar usuarios antiguos de seed que ya no pertenecen a la lista de famosos
    const emailsActuales = usuarios.map((u) => u.email);
    await tx.usuario.deleteMany({
      where: {
        email: {
          endsWith: '@seed.matchify.test',
          notIn: emailsActuales,
        },
      },
    });

    const resultado = [];
    for (const perfil of usuarios) {
      const { ciudad, tipo, intereses, preferencia, ...datos } = perfil;
      const data = { ...datos, ubicacionId: ubicacionIds.get(ciudad), tipoUsuarioId: tipoIds.get(tipo) };
      const usuario = await tx.usuario.upsert({ where: { email: datos.email }, update: data, create: data });
      const { generos, ...rangos } = preferencia;
      const relaciones = generos.map((genero) => ({ genero }));
      await tx.preferencia.upsert({
        where: { usuarioId: usuario.id },
        update: { ...rangos, generos: { deleteMany: {}, create: relaciones } },
        create: { usuarioId: usuario.id, ...rangos, generos: { create: relaciones } },
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

      // Sincronizar fotos de los perfiles de prueba (al menos 3 fotos reales por cada famoso)
      const clave = datos.email.replace('@seed.matchify.test', '');
      const fotosUrls = fotosPorClave[clave] || [];
      await tx.foto.deleteMany({ where: { usuarioId: usuario.id } });
      for (let i = 0; i < fotosUrls.length; i++) {
        await tx.foto.create({
          data: {
            usuarioId: usuario.id,
            url: fotosUrls[i],
            orden: i,
          },
        });
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
      console.log(`Seed completo: 20 hobbies, 9 ubicaciones y ${perfiles.length} perfiles famosos.`);
      console.log(`Referencia: GET /api/usuarios/${perfiles[0].id}/candidatos (${perfiles[0].nombre})`);
    })
    .catch((error) => { console.error(error); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}

module.exports = { seed, hobbies, ubicaciones, usuarios };
