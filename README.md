# EcoLucrum

Landing page do projeto acadêmico de UPX do grupo **Coetus**. A proposta conecta hábitos sustentáveis, EcoPontos e possibilidades de recompensas.

Esta versão foi preparada para manter o código no GitHub e publicar o site no **Cloudflare Pages**, com a enquete armazenada no **Cloudflare D1**. Não exige domínio comprado. Os serviços têm planos gratuitos com limites de uso.

## O que está incluído

- Landing page responsiva com a identidade visual aprovada do EcoLucrum.
- Demonstração em `/demo`: três missões, saldo inicial de 120 EcoPontos e resgate ilustrativo com 200 pontos.
- Exemplos de recompensas e comprovante de resgate simulado.
- Animação da planta com pausa e respeito à preferência por movimento reduzido.
- Enquete anônima com resultados coletivos, persistência no banco e alteração da escolha.

EcoPontos, cupons e recompensas são demonstrativos. As parcerias ainda não foram definidas.

## Publicação gratuita

### 1. GitHub

O código está no repositório [Quaresma-Dev/EcoLucrum-Landpage](https://github.com/Quaresma-Dev/EcoLucrum-Landpage). Mantenha os arquivos deste projeto na raiz dele. O repositório pode ser público ou privado no Cloudflare Pages. Não envie `node_modules`, `dist`, credenciais ou arquivos `.env`.

### 2. Cloudflare Pages

1. Crie uma conta gratuita em [Cloudflare](https://dash.cloudflare.com/sign-up) ou entre na sua conta.
2. Em **Workers & Pages**, crie uma aplicação **Pages** e escolha importar um repositório Git.
3. Conecte o GitHub e selecione `Quaresma-Dev/EcoLucrum-Landpage`.
4. Use as configurações abaixo.

| Campo | Valor |
| --- | --- |
| Framework preset | None |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Raiz do repositório |

O build usa apenas Node.js, sem instalar dependências do projeto. A pasta `functions` fica na raiz do repositório; o Pages compila a função da enquete automaticamente.

Ao publicar, a Cloudflare fornece um endereço terminado em `.pages.dev`. O nome exato depende da disponibilidade. Cada atualização enviada à branch `main` dispara uma nova publicação.

### 3. Banco da enquete

O site visual e a demonstração funcionam antes deste passo. A enquete precisa do banco para salvar e consultar as respostas.

1. No painel da Cloudflare, abra **D1** e crie um banco chamado `ecolucrum-feedback`, no plano gratuito.
2. No console do banco, execute o conteúdo de [`database/schema.sql`](database/schema.sql).
3. Volte ao projeto Pages, em **Settings > Bindings > Add > D1 database bindings**.
4. Em **Variable name**, escreva exatamente `DB`. Selecione o banco `ecolucrum-feedback`.
5. Salve e publique novamente para aplicar a vinculação.

Configure o banco de produção. Se quiser testar a enquete em previews, associe um banco D1 separado no ambiente de preview, com a mesma variável `DB` e o mesmo esquema.

O banco novo começa vazio. Os votos já registrados na hospedagem anterior não são transferidos por este projeto. A versão anterior continua intacta.

Não há chaves de banco no JavaScript público: a API acessa o banco por uma vinculação interna da Cloudflare. A enquete guarda um identificador aleatório do navegador, a escolha e a data; não pede nome ou e-mail. Limpar o armazenamento ou usar outro navegador permite nova participação, portanto isso não é uma votação auditável.

### 4. Conferência após publicar

- Abra a página inicial e clique em **Testar**: a demonstração deve abrir em `/demo`.
- Complete as três missões, simule o resgate de café e recomece a demonstração.
- Envie uma resposta na enquete e confirme que ela aparece no resultado.
- Altere a resposta e confirme que a contagem total não aumenta para o mesmo navegador.
- Confira a navegação no celular.

## Desenvolvimento

Requisito: Node.js 22.13 ou superior. Não há dependências obrigatórias de instalação.

```sh
npm run build
npm test
```

O build gera a landing page em `dist/index.html` e a demonstração em `dist/demo/index.html`. A API é publicada como uma Pages Function em `/api/reward-feedback`.

Para visualizar localmente com o emulador da Cloudflare (Wrangler será baixado pelo `npx`):

```sh
npm run build
npx wrangler@4.92.0 pages dev dist --config wrangler.local.jsonc
```

Para preparar o banco local, em outro terminal na raiz do projeto:

```sh
npx wrangler@4.92.0 d1 execute DB --local --config wrangler.local.jsonc --file=database/schema.sql
```

O arquivo `wrangler.local.jsonc` é exclusivo do emulador e não é lido pela publicação no painel. Ele usa um identificador local, sem acesso a recursos reais.

Os testes automatizados usam SQLite local em memória para conferir persistência, mudança de voto, contagens e rejeição de dados inválidos. Eles não escrevem no banco publicado.

## Estrutura

| Caminho | Conteúdo |
| --- | --- |
| `src/pages/` | Textos e estrutura das duas páginas |
| `src/partials/` | Painel de EcoPontos e diálogo de recompensas compartilhados |
| `public/` | Estilos, scripts, logo e configuração de rotas |
| `scripts/build.mjs` | Montagem dos HTMLs finais |
| `functions/api/reward-feedback.js` | API da enquete, com acesso ao D1 |
| `database/schema.sql` | Criação da tabela da enquete |
| `test/` | Testes da API |

Os caminhos de arquivos começam em `/`, como `/styles.css` e `/demo`, pois o site será publicado na raiz do endereço `.pages.dev`.

Esta versão não deve ser publicada diretamente no GitHub Pages: a enquete usa Pages Functions e D1 da Cloudflare. O GitHub armazena o código e a Cloudflare hospeda a aplicação completa.

## Referências

- [Cloudflare Pages: HTML estático e integração com Git](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [Vincular D1 ao Pages](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases)
- [Limites do Cloudflare Pages](https://developers.cloudflare.com/pages/platform/limits/)
- [Plano gratuito do D1](https://developers.cloudflare.com/d1/platform/pricing/)
