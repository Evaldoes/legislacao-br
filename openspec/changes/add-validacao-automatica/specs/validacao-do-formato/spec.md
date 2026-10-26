## ADDED Requirements

### Requirement: Validar o formato
O comando `npm run check` MUST validar todas as pastas de `normas/` e listar cada problema com o arquivo e o motivo, saindo com erro quando houver algum: frontmatter ausente ou incompleto; `norma` diferente do nome da pasta; `id` diferente de `{norma}-{nome do arquivo}`; id ou âncora repetidos; nota apontando para dispositivo inexistente; link do índice para arquivo inexistente; arquivo de artigo fora do índice; artigo faltando na numeração de uma parte.

#### Scenario: Link quebrado no índice
- **WHEN** o `_norma.md` aponta para `art-999.md`, que não existe
- **THEN** `npm run check` mostra o problema no `_norma.md` e termina com erro

#### Scenario: Artigo pulado
- **WHEN** existem os arquivos dos artigos 1 e 3, mas não o do 2
- **THEN** `npm run check` aponta que falta o artigo 2

### Requirement: Validação em toda mudança
Todo push para `main` e todo pull request MUST rodar automaticamente os testes, a checagem de tipos e `npm run check`, e o resultado MUST aparecer no GitHub.

#### Scenario: Pull request quebrado
- **WHEN** alguém abre um pull request com um arquivo sem frontmatter
- **THEN** a verificação do GitHub falha e mostra o problema
