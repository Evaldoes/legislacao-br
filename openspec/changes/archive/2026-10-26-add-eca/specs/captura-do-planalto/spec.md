## ADDED Requirements

### Requirement: Capturar o ECA
A ferramenta MUST capturar o ECA (Lei nº 8.069/1990) na pasta `normas/lei-8069-1990/`, sem avisos nem lacunas, mantendo como texto do artigo que altera outra lei os artigos e parágrafos citados dessa outra lei.

#### Scenario: Artigo que altera o Código Penal
- **WHEN** a captura encontra o Art. 263 do ECA, que cita artigos do Código Penal
- **THEN** os trechos citados ficam no texto do Art. 263 e não viram parágrafos do ECA
