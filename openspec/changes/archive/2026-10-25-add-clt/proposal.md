## Why

A CLT é a lei que mais afeta o público do Direito Fácil (jornada, férias, demissão, FGTS) e é a base do próximo app da marca. Hoje o repositório só tem a Constituição. A página da CLT no Planalto tem irregularidades que a da Constituição não tem: centenas de trechos de medidas provisórias que perderam a validade ("Vigência encerrada"), epígrafes soltas entre títulos e artigos, notas sem o parêntese de fechamento e erros de digitação nos rótulos ("Art. . 154").

## What Changes

- Nova norma **`decreto-lei-5452-1943`** (Consolidação das Leis do Trabalho, apelido `clt`), capturada da página compilada do Planalto, só os artigos da Consolidação: o decreto que a aprova e o quadro anexo do Art. 577 ficam de fora.
- A captura passa a descartar texto de **medida provisória com vigência encerrada** (inclusões, redações e revogações que não valem mais) e as notas que apontam para elas.
- A captura passa a aceitar as irregularidades da página da CLT, sem mudar o resultado da Constituição.
- A captura semanal e o `npm run check` passam a cobrir a CLT.
- README: a CLT na lista de normas.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `captura-do-planalto`: nova norma e regra para medidas provisórias com vigência encerrada.

## Fora do escopo

- O quadro anexo do Art. 577 (enquadramento sindical), que é uma tabela e não artigos.
- Explicações da CLT e o app da CLT.

## Impact

- `ingestion/laws/decreto-lei-5452-1943.ts`, ajustes em `ingestion/parsers/*` e `ingestion/writing/markdown.ts` com testes, nova pasta `normas/decreto-lei-5452-1943/`, README.
- A Constituição deve continuar sem nenhuma mudança na captura.
