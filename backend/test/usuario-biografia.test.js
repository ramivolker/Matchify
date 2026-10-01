const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const path = require('node:path');
const Module = require('node:module');

// Rutas, controller, validator, service y repository reales; solo Prisma simulado.
let stored;
let lastUpdate;
require.cache[require.resolve('../src/config/prisma')] = {
  exports: {
    usuario: {
      findUnique: async ({ where }) =>
        (where.id === stored.id || where.email === stored.email) ? structuredClone(stored) : null,
      findMany: async () => [structuredClone(stored)],
      update: async ({ data }) => {
        lastUpdate = data;
        for (const [key, value] of Object.entries(data)) {
          if (value !== undefined) stored[key] = value;
        }
        return structuredClone(stored);
      },
    },
  },
};
const app = express();
app.use(express.json());
app.use('/api/usuarios', require('../src/routes/usuario.routes'));
app.use(require('../src/middlewares/error.middleware'));

test('biografía: API cliente, PUT, nueva lectura y completitud del perfil', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  const originalFetch = global.fetch;
  global.fetch = (url, options) => originalFetch(new URL(url, base), options);
  t.after(() => { global.fetch = originalFetch; });
  const { api } = await import('../../frontend/src/services/api.js');

  // Renderizar el componente real con los datos releídos, sin navegador ni nuevas dependencias.
  const frontend = path.resolve(__dirname, '../../frontend');
  const { build } = require('../../frontend/node_modules/esbuild');
  const bundle = await build({
    stdin: {
      contents: `import React from 'react';
        import { renderToStaticMarkup } from 'react-dom/server';
        import MiPerfilTab from './src/components/TinderView/MiPerfilTab.jsx';
        export const render = (user) => renderToStaticMarkup(React.createElement(MiPerfilTab,
          { currentUser: user, hobbies: [], ubicaciones: [] }));`,
      resolveDir: frontend,
    },
    bundle: true, platform: 'node', format: 'cjs', write: false,
  });
  const compiled = new Module(path.join(frontend, 'profile-test.cjs'), module);
  compiled.filename = path.join(frontend, 'profile-test.cjs');
  compiled.paths = Module._nodeModulePaths(frontend);
  compiled._compile(bundle.outputFiles[0].text, compiled.filename);
  const { render } = compiled.exports;

  const fields = {
    nombre: 'Ana', apellido: 'Prueba', email: 'ana@example.com',
    fechaNacimiento: '2000-01-01',
  };
  const reset = () => {
    stored = { id: 1, ...fields, biografia: 'Biografía anterior', hobbies: [{ id: 1 }, { id: 2 }] };
  };
  const assertProfile = (user, expected) => {
    assert.equal(user.biografia, expected);
    const html = render({ ...user, ubicacion: { ciudad: 'Rosario', provincia: 'Santa Fe' } });
    assert.equal(html.includes('profile-completeness-banner'), expected === null);
    if (expected === null) {
      assert.match(html, /75%/);
      assert.doesNotMatch(html, /Biografía anterior/);
    }
  };

  for (const [value, expected] of [
    ['wtf', 'wtf'], ['a', 'a'], ['hola', 'hola'], ['  hola ', 'hola'],
    ['', null], ['    ', null], [null, null],
  ]) {
    await t.test(`guardar ${JSON.stringify(value)} y releer`, async () => {
      reset();
      assertProfile(await api.actualizarUsuario(1, { ...fields, biografia: value }), expected);
      assertProfile((await api.getUsuarios())[0], expected);
      const response = await fetch('/api/usuarios/1');
      assertProfile(await response.json(), expected);
    });
  }

  await t.test('campo omitido conserva la biografía al actualizar otro campo', async () => {
    reset();
    await api.actualizarUsuario(1, { ...fields, nombre: 'Otro nombre' });
    assert.equal(Object.hasOwn(lastUpdate, 'biografia'), false);
    assert.equal(stored.nombre, 'Otro nombre');
    assertProfile((await api.getUsuarios())[0], 'Biografía anterior');
  });

  await t.test('PUT directo normaliza espacios y permite null sin depender del cliente', async () => {
    for (const value of ['', '    ', null, '  hola ']) {
      reset();
      const response = await fetch('/api/usuarios/1', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, biografia: value }),
      });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).biografia, value === '  hola ' ? 'hola' : null);
    }
  });

  await t.test('máximo de 500 caracteres y rechazo de tipos inválidos', async () => {
    reset();
    assert.equal((await api.actualizarUsuario(1, { ...fields, biografia: 'a'.repeat(500) })).biografia.length, 500);
    for (const value of ['a'.repeat(501), 123, false, {}, []]) {
      const response = await fetch('/api/usuarios/1', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, biografia: value }),
      });
      assert.equal(response.status, 400);
      assert.equal(stored.biografia.length, 500);
    }
  });
  await t.test('género propio: guardar, releer, omitir y rechazar valores inválidos', async () => {
    reset();
    for (const genero of ['MASCULINO', 'FEMENINO', 'NO_BINARIO', 'OTRO', null]) {
      assert.equal((await api.actualizarUsuario(1, { ...fields, genero })).genero, genero);
      assert.equal((await (await fetch('/api/usuarios/1')).json()).genero, genero);
    }
    await api.actualizarUsuario(1, { ...fields, genero: 'NO_BINARIO' });
    await api.actualizarUsuario(1, fields);
    assert.equal(stored.genero, 'NO_BINARIO');
    for (const genero of ['TODOS', '', 'femenino', [], {}, 123]) {
      const res = await fetch('/api/usuarios/1', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fields, genero }) });
      assert.equal(res.status, 400);
      assert.equal(stored.genero, 'NO_BINARIO');
    }
  });

});
