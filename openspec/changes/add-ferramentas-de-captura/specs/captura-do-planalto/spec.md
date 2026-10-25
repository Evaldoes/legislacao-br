## ADDED Requirements

### Requirement: Gerar a norma a partir do Planalto
O repositório MUST ter uma ferramenta que baixa a página de uma norma configurada no Portal da Legislação do Planalto (ou lê um HTML salvo), remove os trechos revogados, separa as notas de alteração e escreve um arquivo Markdown por artigo, o `_norma.md` com o índice e o `preambulo.md` quando houver. A ferramenta MUST abortar, sem escrever, quando encontrar lacunas na numeração ou dispositivos fora de lugar, a não ser que seja forçada.

#### Scenario: Capturar a Constituição
- **WHEN** alguém roda `npm run ingest -- constituicao-1988 --out normas`
- **THEN** a pasta `normas/constituicao-1988/` fica com o `_norma.md`, o `preambulo.md` e um arquivo por artigo, no formato do README

### Requirement: Mudar só o que mudou
Um arquivo MUST NOT ser reescrito quando a única diferença para o arquivo existente for a data `capturado_em`. O `_norma.md` MUST manter a data anterior quando nenhum outro arquivo da norma mudou.

#### Scenario: Captura sem mudança na lei
- **WHEN** a Constituição é capturada de novo num outro dia e o texto no Planalto é o mesmo
- **THEN** nenhum arquivo do repositório muda

#### Scenario: Uma emenda mudou um artigo
- **WHEN** a captura encontra o Art. 7º diferente
- **THEN** só o `art-007.md` e o `_norma.md` mudam, ambos com a data da nova captura
