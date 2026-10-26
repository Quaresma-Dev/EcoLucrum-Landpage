(() => {
const demo = document.querySelector("#experiencia");
if (!demo) return;
const tasks = [...document.querySelectorAll('.task')];
const pointsEl = document.querySelector('#points');
const taskCount = document.querySelector('#task-count');
const progress = document.querySelector('#reward-progress');
const progressbar = document.querySelector('[role="progressbar"]');
const status = document.querySelector('#demo-status');
let redeemedReward = null;
let selectedReward = null;
const redeemShortcut = document.querySelector('#demo-redeem');
const resetShortcut = document.querySelector('#demo-reset');
function getDemoPoints() {
  const earned = tasks.filter(task => task.getAttribute('aria-pressed') === 'true')
    .reduce((sum, task) => sum + Number(task.dataset.points), 0);
  return 120 + earned - (redeemedReward ? rewards[redeemedReward].points : 0);
}
function updateDemo() {
  const completed = tasks.filter(task => task.getAttribute('aria-pressed') === 'true');
  const points = getDemoPoints();
  const ready = points >= 200;
  pointsEl.textContent = points;
  taskCount.textContent = `${completed.length} de 3`;
  progress.style.width = `${Math.min(points / 200 * 100, 100)}%`;
  progressbar.setAttribute('aria-valuenow', String(points));
  document.querySelector('#reward-title').textContent = redeemedReward ? 'Resgate simulado concluído' : ready ? 'Resgate disponível' : 'Meta: 200 EcoPontos';
  document.querySelector('#reward-help').textContent = redeemedReward ? 'Resgate simulado concluído. Saldo: 0 EP.' : ready ? '200 EP! Experimente a troca de pontos.' : `Faltam ${200 - points} EP para o exemplo de recompensa`;
  redeemShortcut.hidden = !ready && !redeemedReward;
  redeemShortcut.innerHTML = `${redeemedReward ? 'Ver resgate simulado' : 'Simular resgate'} <svg><use href="#i-arrow"/></svg>`;
  resetShortcut.hidden = !redeemedReward;
  tasks.forEach(task => { task.disabled = Boolean(redeemedReward); });
  status.textContent = redeemedReward ? 'Resgate simulado concluído. Foram utilizados 200 EcoPontos. Seu saldo demonstrativo agora é de 0 EcoPontos.' : `${completed.length} missões concluídas na demonstração. Saldo: ${points} EcoPontos ilustrativos.${ready ? ' Você já pode simular um resgate.' : ''}`;
}
function resetDemo() {
  redeemedReward = null;
  tasks.forEach(task => { task.setAttribute('aria-pressed', 'false'); task.disabled = false; });
  updateDemo();
}
tasks.forEach(task => task.addEventListener('click', () => {
  if (redeemedReward) return;
  task.setAttribute('aria-pressed', task.getAttribute('aria-pressed') !== 'true' ? 'true' : 'false');
  updateDemo();
}));
resetShortcut.addEventListener('click', resetDemo);
const rewards = {
  cafe: {title:'Desconto em café', copy:'Imagine usar seus EcoPontos para aproveitar um café com desconto. Complete as três missões da demonstração e experimente um resgate ilustrativo.', points:200, offer:'10% em um café'},
  mobilidade: {title:'Passeio de bicicleta', copy:'Imagine trocar EcoPontos por uma vantagem no aluguel de bicicletas. Este exemplo apresenta outra possibilidade para um futuro catálogo de benefícios.', points:350, offer:'Benefício em um passeio de bicicleta'},
  lazer: {title:'Atividades culturais', copy:'Imagine transformar seus EcoPontos em um benefício para uma atividade cultural. As condições reais dependerão de validação e de futuras parcerias.', points:500, offer:'Benefício em uma atividade cultural'}
};
const dialog = document.querySelector('#reward-dialog');
const confirmRedeem = document.querySelector('#confirm-redeem');
const checkout = document.querySelector('#dialog-checkout');
const receipt = document.querySelector('#demo-receipt');
const missionsButton = document.querySelector('#dialog-missions');
function showReceipt(key) {
  checkout.hidden = true;
  receipt.hidden = false;
  document.querySelector('#dialog-eyebrow').textContent = 'Demonstração dos EcoPontos';
  document.querySelector('#dialog-title').textContent = 'Resgate simulado';
  document.querySelector('#dialog-copy').textContent = 'Você usou os EcoPontos da demonstração. Abaixo está o comprovante ilustrativo.';
  document.querySelector('#receipt-offer').textContent = rewards[key].offer;
  document.querySelector('#receipt-spent').textContent = `${rewards[key].points} EP`;
  document.querySelector('#receipt-balance').textContent = `${getDemoPoints()} EP`;
}
function openReward(key) {
  selectedReward = key;
  const reward = rewards[key];
  document.querySelector('#dialog-title').textContent = reward.title;
  document.querySelector('#dialog-copy').textContent = reward.copy;
  document.querySelector('#dialog-cost').textContent = reward.points;
  document.querySelector('#dialog-balance').textContent = `Seu saldo: ${getDemoPoints()} EP`;
  document.querySelector('#dialog-eyebrow').textContent = 'Demonstração dos EcoPontos';
  checkout.hidden = false;
  receipt.hidden = true;
  confirmRedeem.disabled = Boolean(redeemedReward) || getDemoPoints() < reward.points;
  const missing = reward.points - getDemoPoints();
  document.querySelector('#dialog-availability').textContent = redeemedReward ? 'Você já concluiu um resgate. Recomece a demonstração para experimentar novamente.' : missing > 0 ? `Faltam ${missing} EP para este exemplo.${key !== 'cafe' ? ' Nesta demonstração, as três missões liberam o exemplo de café.' : ' Complete as três missões para liberá-lo.'}` : 'Tudo pronto. Veja como seria trocar seus pontos por um benefício.';
  missionsButton.textContent = redeemedReward ? 'Recomeçar demonstração' : 'Voltar para as missões';
  if (redeemedReward === key) showReceipt(key);
  if (!dialog.open) dialog.showModal();
}
document.querySelectorAll('.reward-detail').forEach(button => button.addEventListener('click', () => openReward(button.dataset.reward)));
redeemShortcut.addEventListener('click', () => openReward('cafe'));
confirmRedeem.addEventListener('click', () => {
  if (redeemedReward || !selectedReward || getDemoPoints() < rewards[selectedReward].points) return;
  redeemedReward = selectedReward;
  confirmRedeem.disabled = true;
  updateDemo();
  showReceipt(redeemedReward);
});
missionsButton.addEventListener('click', () => {
  if (redeemedReward) resetDemo();
  dialog.close();
  demo.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',block:'center'});
  demo.focus({preventScroll:true});
});
document.querySelectorAll('.dialog-close, .dialog-back').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});


})();
