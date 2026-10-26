import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { onRequest } from '../functions/api/reward-feedback.js';

const idA = '11a6e2f9-20e9-4e89-bdca-5c74821bce1e';
const idB = '22a6e2f9-20e9-4e89-bdca-5c74821bce1e';

function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../database/schema.sql', import.meta.url), 'utf8'));
  const DB = {
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      return {
        async all() { return { results: statement.all() }; },
        bind(...values) { return { async run() { return statement.run(...values); } }; },
      };
    },
  };
  return { sqlite, DB };
}

function request(env, body, method = 'POST', contentType = 'application/json') {
  return onRequest({ env, request: new Request('https://ecolucrum.example/api/reward-feedback', {
    method,
    ...(method === 'GET' ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    headers: { 'Content-Type': contentType },
  }) });
}

test('enquete vazia retorna zero em todas as opções, sem cache', async () => {
  const { DB, sqlite } = database();
  try {
    const response = await request({ DB }, undefined, 'GET');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.deepEqual(await response.json(), {
      counts: { compras: 0, cashback: 0, produtos: 0, experiencias: 0 }, total: 0,
    });
  } finally { sqlite.close(); }
});

test('votos de visitantes diferentes são persistidos e somados', async () => {
  const { DB, sqlite } = database();
  try {
    assert.equal((await request({ DB }, { visitorId: idA, choice: 'produtos' })).status, 200);
    const response = await request({ DB }, { visitorId: idB, choice: 'experiencias' });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      counts: { compras: 0, cashback: 0, produtos: 1, experiencias: 1 }, total: 2, choice: 'experiencias',
    });
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM reward_feedback').get().n, 2);
  } finally { sqlite.close(); }
});

test('alterar a escolha atualiza o mesmo voto e preserva sua data', async () => {
  const { DB, sqlite } = database();
  try {
    await request({ DB }, { visitorId: idA, choice: 'produtos' });
    const before = sqlite.prepare('SELECT created_at FROM reward_feedback').get().created_at;
    const response = await request({ DB }, { visitorId: idA, choice: 'cashback' });
    assert.deepEqual(await response.json(), {
      counts: { compras: 0, cashback: 1, produtos: 0, experiencias: 0 }, total: 1, choice: 'cashback',
    });
    assert.equal(sqlite.prepare('SELECT created_at FROM reward_feedback').get().created_at, before);
  } finally { sqlite.close(); }
});

test('rejeita entradas inválidas sem gravar votos', async () => {
  const { DB, sqlite } = database();
  try {
    for (const body of [null, [], '{', {}, { visitorId: 'inválido', choice: 'compras' },
      { visitorId: idA, choice: "compras'); DROP TABLE reward_feedback; --" }]) {
      assert.equal((await request({ DB }, body)).status, 400);
    }
    assert.equal((await request({ DB }, 'x'.repeat(1025))).status, 413);
    assert.equal((await request({ DB }, '{}', 'POST', 'text/plain')).status, 415);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM reward_feedback').get().n, 0);
  } finally { sqlite.close(); }
});

test('banco não configurado retorna falha sem fingir que o voto foi salvo', async () => {
  for (const method of ['GET', 'POST']) {
    const response = await request({}, { visitorId: idA, choice: 'compras' }, method);
    assert.equal(response.status, 503);
    assert.ok((await response.json()).error);
  }
});

test('recusa métodos não suportados', async () => {
  const response = await request({}, '{}', 'PUT');
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Allow'), 'GET, POST');
});
