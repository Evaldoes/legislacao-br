# captura-do-planalto Specification

## Purpose
TBD - created by archiving change add-ferramentas-de-captura. Update Purpose after archive.
## Requirements
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

### Requirement: Capturar a CLT
A ferramenta MUST capturar a CLT (Decreto-Lei nº 5.452/1943) na pasta `normas/decreto-lei-5452-1943/`, com os artigos da Consolidação a partir do título "CONSOLIDAÇÃO DAS LEIS DO TRABALHO" e até o quadro anexo, sem o decreto que a aprova e sem o anexo.

#### Scenario: Capturar a CLT
- **WHEN** alguém roda `npm run ingest -- decreto-lei-5452-1943 --out normas`
- **THEN** a pasta `normas/decreto-lei-5452-1943/` fica com o `_norma.md` e um arquivo por artigo, do Art. 1º ao Art. 922, sem lacunas e sem avisos

#### Scenario: Constituição não muda
- **WHEN** a Constituição é capturada de novo com as regras novas
- **THEN** nenhum arquivo de `normas/constituicao-1988/` muda

### Requirement: Descartar medidas provisórias com vigência encerrada
Texto marcado pelo Planalto com "Vigência encerrada" MUST NOT aparecer na norma capturada: inclusões e redações de medidas provisórias que perderam a validade são descartadas, revogações feitas por elas não revogam, e as notas dessas medidas provisórias não são registradas.

#### Scenario: Artigo incluído por medida provisória que caducou
- **WHEN** a página traz um artigo riscado, incluído por medida provisória, seguido de "(Vigência encerrada)"
- **THEN** o artigo não aparece na norma

#### Scenario: Revogação por medida provisória que caducou
- **WHEN** um dispositivo em vigor traz a nota "(Revogado pela Medida Provisória nº 905, de 2019) (Vigência encerrada)"
- **THEN** o dispositivo continua com o seu texto e sem essa nota

### Requirement: Capturar o ECA
A ferramenta MUST capturar o ECA (Lei nº 8.069/1990) na pasta `normas/lei-8069-1990/`, sem avisos nem lacunas, mantendo como texto do artigo que altera outra lei os artigos e parágrafos citados dessa outra lei.

#### Scenario: Artigo que altera o Código Penal
- **WHEN** a captura encontra o Art. 263 do ECA, que cita artigos do Código Penal
- **THEN** os trechos citados ficam no texto do Art. 263 e não viram parágrafos do ECA

