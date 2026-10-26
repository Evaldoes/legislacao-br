## Context

A página compilada da CLT no Planalto acumula 80 anos de alterações. Ao contrário da Constituição, ela traz centenas de trechos de medidas provisórias que caducaram, versões antigas de artigos inteiros riscadas sem nota, artigos revogados e depois restaurados, e erros de digitação nos rótulos. A captura não pode mudar o resultado da Constituição.

## Goals / Non-Goals

**Goals:** capturar a CLT inteira (Art. 1º ao 922) sem avisos nem lacunas, com regras gerais (não exceções por artigo), e sem mudar nenhum arquivo da Constituição.

**Non-Goals:** reproduzir tabelas como tabelas; o anexo do Art. 577; corrigir notas que o Planalto põe no lugar errado (como "Vide ADIN" em parágrafo riscado).

## Decisions

1. **"Vigência encerrada" anula a medida provisória.** Um parágrafo riscado cujo único comentário é a vigência encerrada é descartado; a nota da medida provisória seguida de "(Vigência encerrada)" é removida de qualquer texto. Assim, inclusões e redações de medidas provisórias que caducaram somem, e revogações feitas por elas não revogam.
2. **Versões de artigo pela vizinhança.** Um caput riscado sem nota é versão antiga quando há outra versão do mesmo artigo logo depois, uma versão em vigor por perto, ou quando o número está fora da sequência (erro como "Art. 60." entre versões do Art. 670). Sem nada disso, é um artigo riscado sem nota de revogação: o rótulo fica e o artigo é marcado como revogado. Um artigo revogado com nota mas restaurado depois (versão em vigor ao lado) também é descartado.
3. **Dispositivo repetido: vale o que está em vigor.** A revogação de uma versão antiga ao lado do texto em vigor é ignorada; o mesmo texto listado duas vezes vira um só; um dispositivo revogado e restaurado depois é substituído. Dois textos diferentes em vigor continuam gerando aviso.
4. **Erros de digitação comuns viram regra:** "A" fora do risco em "A<strike>rt. 28</strike>", fim de nota fora do risco, "Art. . 154", "401A" sem hífen, "Il" no lugar de "II", nota final sem o parêntese de fechamento, "Suprimido" como sinônimo de revogado e links soltos ("Vigência") depois da nota de revogação.
5. **Linhas logo depois de um título:** continuam o nome quando o nome termina em partícula ("da") ou a linha está em maiúsculas; outras (epígrafes como "Alimentação") são descartadas, porque não fazem parte da estrutura da lei.
6. **Pasta pelo identificador oficial** `decreto-lei-5452-1943`, como manda o README; "clt" fica nos apelidos.

## Risks / Trade-offs

- Heurísticas de vizinhança podem errar numa norma futura → a captura continua abortando com avisos e lacunas, e a Constituição é recapturada para confirmar que nada mudou.
- Epígrafes descartadas → não têm valor normativo; o texto dos artigos é preservado.
- Alguns dispositivos riscados sem nota somem e deixam lacuna na numeração interna (fiel à página) → documentado.
