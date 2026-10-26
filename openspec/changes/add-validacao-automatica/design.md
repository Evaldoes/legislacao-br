## Decisions

### Reaproveitar o leitor e o validador da API
A API do Direito Fácil já lê e valida este formato na importação (`src/import/read.ts` e `validate.ts`). As mesmas regras são copiadas para `checks/` com os testes, e ganham as regras que só fazem sentido aqui: `id` coerente com o nome do arquivo e numeração sem lacunas por parte (`principal`, `adct`…), contando só o número-base ("103-A" conta como 103).
*Alternativa descartada:* um pacote compartilhado entre os dois repositórios — complexidade de publicação para pouco código.

### CI
Um workflow (`ci.yml`) com Node 22: `npm ci`, `npm test`, `npm run typecheck`, `npm run check`. Roda em push para `main` e em pull requests.
