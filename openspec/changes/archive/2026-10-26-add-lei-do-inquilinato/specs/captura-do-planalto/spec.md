## ADDED Requirements

### Requirement: Capturar a Lei do Inquilinato
A ferramenta MUST capturar a Lei do Inquilinato (Lei nº 8.245/1991) na pasta `normas/lei-8245-1991/`, sem avisos nem lacunas.

#### Scenario: Capturar a Lei do Inquilinato
- **WHEN** alguém roda `npm run ingest -- lei-8245-1991 --out normas`
- **THEN** a pasta fica com o `_norma.md` e um arquivo por artigo, do Art. 1º ao Art. 90
