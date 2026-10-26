## Why

Quem usa este repositório (a API do Direito Fácil, apps, pesquisas, sistemas de IA) depende de o formato estar sempre certo. Hoje nada impede um pull request com frontmatter faltando, âncora repetida, link quebrado no índice ou artigo pulado. A validação só acontecia na importação da API, longe de quem fez a mudança.

## What Changes

- Comando **`npm run check`**, que valida todas as pastas de `normas/` e lista cada problema com o arquivo e o motivo:
  - frontmatter presente e com os campos obrigatórios (`_norma.md`, artigos, preâmbulo);
  - campo `norma` igual ao nome da pasta e `id` igual a `{norma}-{nome do arquivo}`;
  - ids e âncoras sem repetição;
  - notas apontando para dispositivos que existem;
  - todo link do índice aponta para um arquivo existente, e todo arquivo de artigo está no índice;
  - nenhum artigo faltando na numeração de cada parte.
- **GitHub Actions** em todo push e pull request: testes, typecheck e `npm run check`.
- Selo de status no README.

## Capabilities

### New Capabilities
- `validacao-do-formato`: validar o formato público em toda mudança.

### Modified Capabilities
(nenhuma)

## Fora do escopo

- Comparar o texto com o Planalto (é a atualização automática).
- Validar a redação jurídica.

## Impact

- Novo `checks/` (leitura e validação do formato, CLI, testes), `.github/workflows/ci.yml`, script `check`, README.
