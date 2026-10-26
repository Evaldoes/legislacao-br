## ADDED Requirements

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
