const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  navigation.classList.toggle('open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
const projectArt = document.querySelector('.manifesto-art');
if (projectArt) {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionToggle = projectArt.querySelector('.motion-toggle');
  const syncMotionPreference = () => {
    projectArt.classList.toggle('has-motion', !motionPreference.matches);
    motionToggle.hidden = motionPreference.matches;
  };
  syncMotionPreference();
  motionPreference.addEventListener('change', syncMotionPreference);
  if ('IntersectionObserver' in window) {
    const projectObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        projectArt.classList.toggle('is-visible', entry.isIntersecting);
        if (entry.isIntersecting) projectArt.classList.add('is-revealed');
      });
    }, {threshold: 0.2});
    projectObserver.observe(projectArt);
  } else {
    projectArt.classList.add('is-visible', 'is-revealed');
  }
  motionToggle.addEventListener('click', () => {
    const paused = projectArt.dataset.paused !== 'true';
    projectArt.dataset.paused = String(paused);
    motionToggle.setAttribute('aria-pressed', String(paused));
    motionToggle.setAttribute('aria-label', paused ? 'Retomar animação da planta' : 'Pausar animação da planta');
    motionToggle.title = paused ? 'Retomar animação' : 'Pausar animação';
  });
}

const feedbackForm = document.querySelector('#feedback-form');
const feedbackResults = document.querySelector('#feedback-results');
const feedbackSubmit = document.querySelector('#feedback-submit');
const feedbackStatus = document.querySelector('#feedback-status');
const feedbackView = document.querySelector('#feedback-view');
const feedbackLabels = {
  compras: 'Descontos em compras', cashback: 'Cashback',
  produtos: 'Produtos sustentáveis', experiencias: 'Experiências e passeios'
};
const feedbackStorageKey = 'ecolucrum-feedback-v1';
let savedFeedback;
try { savedFeedback = JSON.parse(localStorage.getItem(feedbackStorageKey) || 'null'); } catch { savedFeedback = null; }
function anonymousId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
const visitorId = typeof savedFeedback?.visitorId === 'string' && /^[0-9a-f-]{36}$/i.test(savedFeedback.visitorId) ? savedFeedback.visitorId : anonymousId();
let feedbackChoice = Object.hasOwn(feedbackLabels, savedFeedback?.choice) ? savedFeedback.choice : null;
if (feedbackChoice) feedbackForm.querySelector(`input[value="${feedbackChoice}"]`).checked = true;
function setFeedbackStatus(message, error = false) {
  feedbackStatus.textContent = message;
  feedbackStatus.classList.toggle('has-error', error);
}
function renderFeedbackResults(data) {
  const total = Number(data.total);
  if (!Number.isFinite(total) || total < 0 || !data.counts) throw new Error('Não foi possível carregar os resultados.');
  const bars = document.querySelector('#feedback-bars');
  bars.replaceChildren();
  for (const [key,label] of Object.entries(feedbackLabels)) {
    const votes = Math.max(0, Number(data.counts[key]) || 0);
    const percentage = total > 0 ? Math.round(votes / total * 100) : 0;
    const item = document.createElement('div');
    item.className = 'feedback-result-row';
    const heading = document.createElement('div');
    const name = document.createElement('span');
    name.textContent = label + (feedbackChoice === key ? ' · sua escolha' : '');
    const value = document.createElement('strong');
    value.textContent = `${percentage}%`;
    heading.append(name, value);
    const track = document.createElement('div');
    track.className = 'feedback-result-track';
    const fill = document.createElement('span');
    fill.style.width = `${percentage}%`;
    track.append(fill);
    item.append(heading,track);
    bars.append(item);
  }
  document.querySelector('#feedback-results-title').textContent = 'Resultado da enquete';
  document.querySelector('#feedback-total').textContent = `${total} ${total === 1 ? 'resposta' : 'respostas'}`;
  document.querySelector('#feedback-edit').textContent = feedbackChoice ? 'Alterar minha resposta' : 'Quero participar';
  feedbackForm.hidden = true;
  feedbackResults.hidden = false;
}
async function readFeedbackResults() {
  const response = await fetch('/api/reward-feedback', {cache:'no-store'});
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Não foi possível carregar os resultados.');
  return data;
}
feedbackForm.addEventListener('change', () => {
  feedbackSubmit.disabled = !feedbackForm.querySelector('input:checked');
  setFeedbackStatus('');
});
feedbackForm.addEventListener('submit', async event => {
  event.preventDefault();
  const choice = feedbackForm.querySelector('input:checked')?.value;
  if (!choice || !Object.hasOwn(feedbackLabels, choice)) return;
  feedbackSubmit.disabled = true;
  setFeedbackStatus('Enviando sua escolha…');
  try {
    const response = await fetch('/api/reward-feedback', {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({visitorId,choice})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível enviar. Tente novamente.');
    feedbackChoice = choice;
    try { localStorage.setItem(feedbackStorageKey, JSON.stringify({visitorId,choice})); } catch { /* Participation also works without browser storage. */ }
    renderFeedbackResults(data);
    setFeedbackStatus('Resposta registrada. Obrigado por participar.');
  } catch (error) {
    setFeedbackStatus(error.message || 'Não foi possível enviar. Tente novamente.', true);
  } finally {
    feedbackSubmit.disabled = false;
  }
});
feedbackView.addEventListener('click', async () => {
  feedbackView.disabled = true;
  setFeedbackStatus('Carregando resultados…');
  try { renderFeedbackResults(await readFeedbackResults()); setFeedbackStatus(''); }
  catch (error) { setFeedbackStatus(error.message || 'Não foi possível carregar os resultados.', true); }
  finally { feedbackView.disabled = false; }
});
document.querySelector('#feedback-edit').addEventListener('click', () => {
  feedbackResults.hidden = true;
  feedbackForm.hidden = false;
  feedbackSubmit.disabled = !feedbackForm.querySelector('input:checked');
  setFeedbackStatus('');
});
if (feedbackChoice) {
  readFeedbackResults().then(renderFeedbackResults).catch(() => {
    setFeedbackStatus('Os resultados estão temporariamente indisponíveis. Você pode tentar novamente.',true);
  });
}
