## Context

O código veio da API (`ingestion/`): baixa a página do Planalto (ISO-8859-1), extrai blocos, classifica (artigo, inciso, parágrafo, alínea, título…), remove o que está riscado (revogado), separa as notas de alteração e escreve um Markdown por artigo. Cada arquivo leva `capturado_em` no frontmatter.

## Decisions

### Mesmo código, novo lugar
Copiar a pasta sem mudar a lógica, com os 109 testes. Dependências: cheerio, iconv-lite, yaml; tsx para rodar; Vitest para testar.

### Data de captura estável
`keepIfOnlyCaptureDateChanged(previous, next)` (função pura, testada): compara os dois textos ignorando a linha `capturado_em:` do frontmatter; se forem iguais, devolve o texto anterior. A CLI aplica isso a cada arquivo de artigo e ao preâmbulo; o `_norma.md` mantém a versão anterior quando nenhum outro arquivo mudou. Resultado: uma captura sem mudança na lei não mexe em nenhum arquivo.
*Alternativa descartada:* tirar `capturado_em` dos artigos — quebraria o formato público e a API.

### HTML bruto fora do Git
Cada captura tem cerca de 1,8 MB; guardar toda semana incharia o repositório. Fica em `ingestion/raw/` (ignorado) para depuração local.

## Risks / Trade-offs

- [Planalto muda o HTML] → a captura aborta com avisos (lacunas na numeração, dispositivos fora de lugar), como já fazia.
