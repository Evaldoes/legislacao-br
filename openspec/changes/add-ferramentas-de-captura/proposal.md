## Why

O texto deste repositório é gerado por um programa que lê o Portal da Legislação do Planalto, mas esse programa estava num repositório privado. Ninguém de fora conseguia reproduzir, conferir ou melhorar a captura, e não havia como automatizar a atualização aqui. Além disso, toda captura reescrevia a data `capturado_em` dos 426 arquivos da Constituição, mesmo quando nada na lei mudava, o que esconderia as mudanças reais num diff enorme.

## What Changes

- As ferramentas de captura passam a morar aqui, em `ingestion/`, com os testes. `npm run ingest -- <norma> --out normas` gera ou atualiza a pasta da norma.
- Os arquivos só mudam quando o **conteúdo** muda: se a única diferença for a data `capturado_em`, o arquivo antigo é mantido. O `_norma.md` só ganha a data nova quando algum arquivo da norma mudou.
- O HTML baixado do Planalto fica só na máquina (`ingestion/raw/`, fora do Git).
- `package.json`, TypeScript e Vitest na raiz; README e CONTRIBUTING explicam como rodar.

## Capabilities

### New Capabilities
- `captura-do-planalto`: gerar os arquivos de uma norma a partir do Planalto, mudando só o que mudou.

### Modified Capabilities
(nenhuma)

## Fora do escopo

- Novas normas (cada uma é uma mudança própria).
- Validação automática e atualização automática (mudanças seguintes).

## Impact

- Novos `ingestion/`, `package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`; README e CONTRIBUTING.
- A API do Direito Fácil deixa de ter a ingestão (mudança própria lá).
