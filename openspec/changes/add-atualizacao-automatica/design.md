## Decisions

### Pull request, nunca commit direto
O texto público só muda depois de uma pessoa olhar o diff. O workflow usa `peter-evans/create-pull-request` num ramo fixo (`atualizacao/planalto`): se já houver um pull request aberto, ele é atualizado em vez de criar outro.

### Descrição a partir do diff
`describeChanges(diff, date)` (pura, testada) lê o diff unificado de `normas/`:
- normas e arquivos alterados (o `_norma.md` não conta como artigo);
- notas novas (linhas `+    texto: …`), das quais extrai "Emenda Constitucional nº 141, de 2026" → "EC 141/2026" e "Lei nº 14.601, de 2023" → "Lei 14.601/2023".
O título usa a norma (ou "várias normas") e até 3 referências; sem referência, a data.

### Falhas visíveis
Captura com lacunas ou dispositivos fora de lugar aborta (não há `--force` no workflow). Um workflow falho gera aviso por e-mail do GitHub para quem administra o repositório.

## Risks / Trade-offs

- [O Planalto bloquear acessos de servidores fora do Brasil] → testar com uma execução manual; se bloquear, rodar a captura de uma máquina no Brasil (o mesmo `npm run ingest:all`) e abrir o pull request manualmente.
