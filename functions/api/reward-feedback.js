const choices = ['compras', 'cashback', 'produtos', 'experiencias'];
const headers = { 'Cache-Control': 'no-store' };
const visitorPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(body, status = 200, extraHeaders = {}) {
  return Response.json(body, { status, headers: { ...headers, ...extraHeaders } });
}

async function getResults(db) {
  const { results } = await db.prepare(
    'SELECT choice, COUNT(*) AS votes FROM reward_feedback GROUP BY choice'
  ).all();
  const counts = Object.fromEntries(choices.map(choice => [choice, 0]));
  for (const row of results) {
    if (choices.includes(row.choice)) counts[row.choice] = Number(row.votes);
  }
  return { counts, total: Object.values(counts).reduce((sum, votes) => sum + votes, 0) };
}

export async function onRequest({ request, env }) {
  if (!['GET', 'POST'].includes(request.method)) {
    return json({ error: 'Método não permitido.' }, 405, { Allow: 'GET, POST' });
  }

  if (request.method === 'GET') {
    try { return json(await getResults(env.DB)); }
    catch { return json({ error: 'Não foi possível carregar os resultados.' }, 503); }
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ error: 'Formato de resposta inválido.' }, 415);
  }

  try {
    const text = await request.text();
    if (text.length > 1024) return json({ error: 'Resposta muito longa.' }, 413);
    let body;
    try { body = JSON.parse(text); }
    catch { return json({ error: 'Resposta inválida.' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return json({ error: 'Resposta inválida.' }, 400);
    }
    const { visitorId, choice } = body;
    if (typeof visitorId !== 'string' || !visitorPattern.test(visitorId)
      || typeof choice !== 'string' || !choices.includes(choice)) {
      return json({ error: 'Escolha uma das recompensas para participar.' }, 400);
    }

    await env.DB.prepare(
      'INSERT INTO reward_feedback (visitor_id, choice, created_at) VALUES (?, ?, ?) '
      + 'ON CONFLICT(visitor_id) DO UPDATE SET choice = excluded.choice'
    ).bind(visitorId, choice, Date.now()).run();
    return json({ ...(await getResults(env.DB)), choice });
  } catch {
    return json({ error: 'Não foi possível enviar. Tente novamente em instantes.' }, 503);
  }
}
