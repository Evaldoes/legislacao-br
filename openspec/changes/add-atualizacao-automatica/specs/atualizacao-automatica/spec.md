## ADDED Requirements

### Requirement: Captura semanal
O repositório MUST capturar automaticamente todas as normas configuradas toda semana e também quando acionado manualmente. Quando nada mudou, MUST terminar sem alterar o repositório. Quando a captura falhar, a execução MUST falhar de forma visível no GitHub.

#### Scenario: Semana sem mudança
- **WHEN** a captura de segunda-feira encontra o mesmo texto no Planalto
- **THEN** nenhum commit nem pull request é criado

### Requirement: Pull request para revisão
Quando a captura mudar algum arquivo e a validação passar, o repositório MUST abrir (ou atualizar) um pull request com as mudanças, sem juntá-lo sozinho. O título MUST citar a norma e as emendas ou leis das notas novas; a descrição MUST listar os arquivos alterados e as notas novas.

#### Scenario: Emenda nova
- **WHEN** a captura encontra o Art. 7º com a nota "Redação dada pela Emenda Constitucional nº 141, de 2026"
- **THEN** abre um pull request "constituicao-1988: atualização do Planalto (EC 141/2026)" listando o `art-007.md`
