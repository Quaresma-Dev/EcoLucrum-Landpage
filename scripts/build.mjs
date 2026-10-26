import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const fragments = {
  '<!--ECOLUCRUM_DEMO_PANEL-->': await readFile(path.join(root, 'src/partials/demo-panel.html'), 'utf8'),
  '<!--ECOLUCRUM_REWARD_DIALOG-->': await readFile(path.join(root, 'src/partials/reward-dialog.html'), 'utf8'),
};

function render(template) {
  for (const [marker, content] of Object.entries(fragments)) {
    if (template.split(marker).length !== 2) throw new Error(`Marcador ausente ou duplicado: ${marker}`);
    template = template.replace(marker, () => content);
  }
  return template;
}

await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, 'demo'), { recursive: true });
await cp(path.join(root, 'public'), output, { recursive: true });
for (const [source, destination] of [['index.html', 'index.html'], ['demo.html', 'demo/index.html']]) {
  const html = await readFile(path.join(root, 'src/pages', source), 'utf8');
  await writeFile(path.join(output, destination), render(html));
}
console.log('Site gerado em dist/: landing page, demonstração e arquivos visuais.');
