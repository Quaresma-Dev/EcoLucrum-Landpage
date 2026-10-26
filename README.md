<p align="center">
  <img src="public/assets/ecolucrum-logo.png" alt="EcoLucrum" width="360">
</p>

<h1 align="center">Hábitos que viram EcoPontos.</h1>

<p align="center">
  Pequenas atitudes sustentáveis, uma jornada mais motivadora.
</p>

<p align="center">
  <a href="https://ecolucrum-landpage.pages.dev/"><strong>Acessar o site</strong></a>
  &nbsp;·&nbsp;
  <a href="https://ecolucrum-landpage.pages.dev/demo/">Experimentar a demonstração</a>
</p>

<p align="center">
  Projeto acadêmico de UPX · Desenvolvido pelo grupo <strong>Coetus</strong>
</p>

---

## A proposta

O **EcoLucrum** propõe aproximar a sustentabilidade das escolhas que fazemos todos os dias. A ideia é reunir hábitos, desafios e recompensas em uma experiência simples, que incentive a continuidade dessas atitudes.

Usar uma garrafa reutilizável, separar materiais recicláveis ou levar uma ecobag são exemplos de ações que podem fazer parte dessa jornada. Na proposta do projeto, essas atitudes geram **EcoPontos**, que poderão ser trocados por benefícios.

A landing page apresenta essa ideia, permite experimentar uma simulação e reúne opiniões para ajudar o grupo a definir recompensas mais atrativas.

## Como essa jornada funciona

1. **Escolha uma missão:** encontre uma atitude sustentável para incluir na rotina.
2. **Acumule EcoPontos:** acompanhe os pontos associados às ações.
3. **Explore recompensas:** conheça possibilidades de benefícios que podem incentivar novos hábitos.

> O projeto está em desenvolvimento. Os pontos e resgates da demonstração são fictícios; as parcerias, as regras e as recompensas reais ainda serão definidas.

## Explore o projeto

| Na landing page | O que você encontra |
| --- | --- |
| **Demonstração interativa** | Três missões para experimentar a dinâmica dos EcoPontos. |
| **Resgate simulado** | Uma troca ilustrativa de pontos por uma recompensa, com comprovante e saldo atualizado. |
| **Exemplos de recompensas** | Possibilidades de benefícios para o dia a dia. |
| **Enquete anônima** | Escolha a recompensa que mais te motivaria e consulte os resultados coletivos. |
| **Interface responsiva** | Navegação para celular e computador, animação com pausa e respeito à preferência por movimento reduzido. |

**Experimente:** a demonstração começa com **120 EcoPontos**. Complete as três missões para chegar a **200** e simular o resgate de café.

## Tecnologias

| Tecnologia | Uso no projeto |
| --- | --- |
| **HTML, CSS e JavaScript** | Interface, animações e interações. |
| **Node.js** | Montagem dos arquivos finais e execução dos testes. |
| **Cloudflare Pages e Pages Functions** | Hospedagem do site e API da enquete. |
| **Cloudflare D1 · SQLite** | Armazenamento das respostas da enquete. |
| **GitHub** | Versionamento do código e integração com a publicação. |

## Desenvolvimento e publicação

<details>
<summary><strong>Ver configuração, comandos e estrutura</strong></summary>

### Executar localmente

Requisito: **Node.js 22.13 ou superior**. O build não exige dependências adicionais do projeto.

```sh
git clone https://github.com/Quaresma-Dev/EcoLucrum-Landpage.git
cd EcoLucrum-Landpage
npm run build
npm test
```

Para preparar o banco local e iniciar o emulador da Cloudflare:

```sh
npx wrangler@4.92.0 d1 execute DB --local --config wrangler.local.jsonc --file=database/schema.sql
npx wrangler@4.92.0 pages dev dist --config wrangler.local.jsonc
```

O `npx` baixa o Wrangler quando necessário. O arquivo `wrangler.local.jsonc` configura apenas o ambiente local.

### Publicar na Cloudflare Pages

Conecte o repositório ao Cloudflare Pages e use:

| Campo | Valor |
| --- | --- |
| Framework preset | `None` |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Raiz do repositório |

Para a enquete, crie um banco D1, execute [`database/schema.sql`](database/schema.sql) e vincule o banco ao projeto Pages com o nome **`DB`**. Publique novamente após configurar a vinculação. Previews podem usar um banco separado com o mesmo esquema.

O GitHub armazena o código; a aplicação completa é hospedada na Cloudflare. A enquete depende de Pages Functions e D1.

### Estrutura

| Caminho | Conteúdo |
| --- | --- |
| `src/pages/` | Páginas inicial e de demonstração. |
| `src/partials/` | Painel de EcoPontos e diálogo de recompensas. |
| `public/` | Estilos, scripts e logo. |
| `scripts/build.mjs` | Montagem dos HTMLs em `dist/`. |
| `functions/api/reward-feedback.js` | API da enquete. |
| `database/schema.sql` | Esquema do banco. |
| `test/` | Testes da API com SQLite em memória. |

A enquete não solicita nome ou e-mail. Ela registra um identificador aleatório do navegador, a escolha e a data. A mesma identificação permite alterar a resposta; limpar o armazenamento ou usar outro navegador permite nova participação.

Os testes verificam persistência, contagens, alteração de voto e rejeição de entradas inválidas em um banco local em memória.

### Documentação de referência

- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Vinculação do D1 ao Pages](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases)

</details>

---

<p align="center">
  <strong>EcoLucrum</strong> · Uma ideia cultivada pelo grupo <strong>Coetus</strong>.
</p>
