# jwt-api — Sistema de Biblioteca

API REST para gestão de biblioteca (categorias, autores, livros, leitores, atendentes, empréstimos e devoluções) com autenticação JWT por **access token + refresh token com rotação**.

Stack: Node.js 20+, Express 5, Sequelize 6, SQLite, jsonwebtoken, bcrypt.

Enunciado do trabalho: [docs/ENUNCIADO.md](docs/ENUNCIADO.md).

## Instalação

```bash
npm install
cp .envex .env      # no Windows: copy .envex .env
# edite o .env (veja abaixo)
npm start           # SERVIDOR RODANDO http://localhost:3000
```

O banco `database.sqlite` é criado automaticamente na primeira execução (e não é versionado).

## Variáveis de ambiente

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `JWT_SECRET` | sim | — | Chave do access token |
| `JWT_REFRESH_SECRET` | sim | — | Chave do refresh token (diferente da anterior) |
| `PORT` | não | `3000` | Porta da API |
| `ACCESS_TOKEN_EXPIRES` | não | `15m` | Validade do access token (`30s` para demonstrar o refresh) |
| `REFRESH_TOKEN_DAYS` | não | `7` | Validade do refresh token, em dias |
| `CORS_ORIGIN` | não | `http://localhost:5173` | Origem(ns) do front, separadas por vírgula |
| `ADMIN_NAME`, `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | não | ver abaixo | Dados do admin criado pelo seed |
| `DB_STORAGE` | não | `./database.sqlite` | Caminho do arquivo SQLite |

Para gerar chaves aleatórias:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Usuário admin (seed)

Ao iniciar, se não existir nenhum administrador, a API cria um:

- **E-mail:** `admin@biblioteca.com`
- **Senha:** `123456`

(Altere pelas variáveis `ADMIN_*` do `.env`.) A rota `POST /v1/user` não é mais pública: só um administrador cria atendentes.

## Estrutura

```
auth/       router, controller, service, middleware (auth + isAdmin), refreshToken.model
user/       atendentes e administradores
category/   author/   book/ (inclui bookAuthor.model)   reader/   loan/   report/
models/index.js   associações (hasMany, belongsTo, belongsToMany)
config/db.js      conexão Sequelize      config/seed.js   admin inicial
utils/            HttpError, errorHandler global, utilitários de data
docs/biblioteca.postman_collection.json   coleção para Postman/Insomnia
```

Cada recurso segue `router → controller → service → model`. Os services lançam `HttpError(status, mensagem)` e um `errorHandler` global converte em JSON `{ "error": "..." }` (o Express 5 encaminha erros de funções `async` automaticamente).

## Modelagem

- `User` 1:N `Loan` (atendente que registrou) e 1:N `RefreshToken`
- `Category` 1:N `Book`
- `Book` N:N `Author` via `BookAuthor`
- `Reader` 1:N `Loan`; `Book` 1:N `Loan`

## Endpoints

Todas exigem `Authorization: Bearer <accessToken>`, exceto login e refresh. **(A)** = somente administrador.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/v1/auth/login` | `{ email, password }` → `{ accessToken, refreshToken, user }` |
| POST | `/v1/auth/refresh` | `{ refreshToken }` → novo par de tokens |
| POST | `/v1/auth/logout` | `{ refreshToken }` → revoga o refresh token |
| GET | `/v1/auth/me` | Usuário logado |
| GET / POST | `/v1/user` | Listar / criar atendente (A) |
| GET / PUT | `/v1/user/:id` | Buscar / editar atendente (A) |
| PATCH | `/v1/user/:id/active` | `{ active: true\|false }` (A) |
| GET / POST | `/v1/categories` | Listar (`?name=`) / criar (escrita A) |
| GET / PUT / DELETE | `/v1/categories/:id` | |
| GET / POST | `/v1/authors` | Listar (`?name=`) / criar (escrita A) |
| GET / PUT / DELETE | `/v1/authors/:id` | |
| GET | `/v1/books?title=&categoryId=&authorId=&available=true` | Busca com filtros |
| POST | `/v1/books` | `{ title, isbn, year, totalCopies, categoryId, authorIds: [] }` (A) |
| GET / PUT / DELETE | `/v1/books/:id` | (escrita A) |
| GET / POST | `/v1/readers` | Listar (`?search=` nome ou CPF) / criar |
| GET / PUT | `/v1/readers/:id` | |
| GET | `/v1/readers/:id/loans` | Histórico do leitor |
| GET | `/v1/loans?status=ATIVO\|ATRASADO\|DEVOLVIDO` | Listar (também `readerId`, `bookId`) |
| POST | `/v1/loans` | `{ bookId, readerId }` |
| GET | `/v1/loans/:id` | |
| PATCH | `/v1/loans/:id/return` | Registrar devolução |
| GET | `/v1/reports/dashboard` | Totais (A) |

### Códigos de resposta

| Código | Quando |
|---|---|
| 400 | Dados inválidos ou faltando |
| 401 | Sem token, token inválido/expirado, credenciais erradas, usuário desativado, refresh inválido |
| 403 | Atendente acessando rota de administrador |
| 404 | Registro não encontrado |
| 409 | Duplicidade (nome/ISBN/CPF/e-mail) ou exclusão de registro com vínculos |
| 422 | Regra de negócio do empréstimo violada (sem estoque, limite de 3, leitor com atraso) |

## Regras de negócio

- Empréstimo só com `availableCopies > 0`; empréstimo decrementa e devolução incrementa o estoque.
- Prazo de 7 dias (`dueDate = loanDate + 7`).
- Máximo de 3 empréstimos em aberto por leitor; leitor com empréstimo atrasado não pega livro.
- Devolução após o prazo: multa de R$ 1,00 por dia, gravada em `fine`.
- `status`: `ATIVO`, `ATRASADO`, `DEVOLVIDO`. O `ATRASADO` é derivado (`dueDate < hoje` e sem `returnDate`) e atualizado no banco antes de cada consulta de empréstimos, para que filtros e contagens fiquem corretos. Empréstimos em aberto retornam também `daysLate` e `estimatedFine` (multa até hoje).
- Não é possível excluir categoria com livros, autor vinculado a livros, ou livro com empréstimos (abertos ou histórico) → **409**.
- Não é possível reduzir `totalCopies` abaixo da quantidade emprestada → **409**.
- Empréstimo e devolução rodam em `db.transaction`. O decremento do estoque é condicional (`WHERE availableCopies > 0`), então o estoque nunca fica negativo.
- Atendente desativado não faz login, e ao ser desativado todos os seus refresh tokens são revogados.
- Um administrador não pode desativar a si mesmo.

## Autenticação — decisões

- **Access token**: JWT (`JWT_SECRET`), 15 min, payload `{ id, name, email, isAdmin }`.
- **Refresh token**: JWT (`JWT_REFRESH_SECRET`) com `jti` aleatório (`crypto.randomBytes`), 7 dias, salvo na tabela `RefreshTokens` (`token`, `userId`, `expiresAt`, `revoked`).
- **Rotação**: cada `/auth/refresh` revoga o refresh usado e emite um novo par.
- **Detecção de roubo**: se um refresh já revogado for reapresentado, todos os refresh tokens do usuário são revogados e a API responde 401, o que encerra todas as sessões dele.
- **Middleware** responde **401** para token ausente, inválido ou expirado (antes era 400), para que o front saiba quando renovar. O `isAdmin` responde **403**.
- **`logout_list` removida.** A blacklist guardava todo access token deslogado e era consultada a cada requisição. Com access tokens de 15 minutos, o logout revoga o refresh token e o access token restante expira sozinho em pouco tempo. Isso mantém a autenticação stateless (sem ida ao banco por requisição). O custo é que um access token roubado continua válido por até 15 minutos.
- Desativar um atendente revoga os refresh tokens dele. O access token que ele já tem vale até expirar (no máximo 15 min), pela mesma razão.

## Testando

Importe `docs/biblioteca.postman_collection.json` no Postman ou no Insomnia. Rode **Auth → Login** primeiro: o script da requisição salva `accessToken` e `refreshToken` nas variáveis da coleção, e as demais requisições usam o Bearer automaticamente.

Para demonstrar a renovação, use `ACCESS_TOKEN_EXPIRES=30s` no `.env`.
