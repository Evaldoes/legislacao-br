## Why

A lei muda por emendas e novas leis, e este repositório só fica certo se alguém lembrar de capturar o Planalto de novo. Exemplo real: a Emenda Constitucional 141/2026 muda o inciso XV do Art. 7º em 16/12/2026. Sem automação, a mudança depende de memória; com ela, aparece sozinha para revisão.

## What Changes

- Um workflow do GitHub Actions (`atualizacao.yml`) roda **toda segunda-feira** (e também sob demanda) e captura todas as normas configuradas.
- Se nada mudou, termina sem fazer nada (a captura já não reescreve arquivos sem mudança).
- Se algo mudou, roda a validação e **abre um pull request** para revisão humana:
  - título com a norma e as emendas ou leis citadas nas notas novas, por exemplo "constituicao-1988: atualização do Planalto (EC 141/2026)";
  - descrição com os artigos alterados e as notas novas.
- Se a captura falhar (Planalto fora do ar, página mudou de formato, lacunas na numeração), o workflow falha e o GitHub avisa por e-mail.
- `npm run ingest:all` captura todas as normas de uma vez, também na máquina.

## Capabilities

### New Capabilities
- `atualizacao-automatica`: captura semanal com pull request para revisão.

### Modified Capabilities
(nenhuma)

## Fora do escopo

- Juntar o pull request sem revisão.
- Avisar a API do Direito Fácil (ela importa quando a equipe quiser).

## Impact

- `.github/workflows/atualizacao.yml`, `ingestion/ingest-all.ts`, `ingestion/changes.ts` (descrição das mudanças) e `ingestion/describe-changes.ts`; README.
- Configuração do repositório: permitir que o GitHub Actions abra pull requests.
