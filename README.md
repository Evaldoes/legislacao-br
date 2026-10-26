<div align="center">

# 📜 legislacao-br

**A legislação federal brasileira em Markdown, versionada com Git.**
**Cada artigo é um arquivo. Cada emenda é um commit.**

[![CI](https://github.com/Evaldoes/legislacao-br/actions/workflows/ci.yml/badge.svg)](https://github.com/Evaldoes/legislacao-br/actions/workflows/ci.yml)
[![Licença: CC0-1.0](https://img.shields.io/badge/licen%C3%A7a-CC0%201.0-lightgrey.svg)](LICENSE)
[![PRs bem-vindos](https://img.shields.io/badge/PRs-bem--vindos-brightgreen.svg)](CONTRIBUTING.md)
[![Formato: Markdown + YAML](https://img.shields.io/badge/formato-Markdown%20%2B%20YAML-blue.svg)](#-formato-dos-arquivos)
[![Fonte: Planalto](https://img.shields.io/badge/fonte-planalto.gov.br-green.svg)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm)

[Por quê?](#-por-que-este-projeto-existe) ·
[O que tem aqui](#-o-que-tem-aqui) ·
[Formato](#-formato-dos-arquivos) ·
[Como usar](#-como-usar) ·
[Usando com IA](#-usando-com-ia-llms-rag-e-agentes) ·
[Contribuir](#-como-contribuir) ·
[English](#-english)

</div>

---

## 💡 Por que este projeto existe

A lei brasileira é pública, mas **não é fácil de usar como dado**.

O texto oficial está no [Portal da Legislação do Planalto](https://www.planalto.gov.br/legislacao) em HTML dos anos 2000. As páginas usam codificação ISO-8859-1, misturam texto em vigor com centenas de trechos revogados riscados e não têm nenhuma marcação de estrutura. Quem quer construir algo com a lei, seja um app, uma pesquisa, um chatbot ou uma visualização, **escreve o mesmo scraper de novo, do zero**.

Este repositório resolve isso uma vez, para todo mundo:

- ✅ **Texto em vigor**, sem os trechos revogados
- ✅ **Um arquivo por artigo**, com a hierarquia (título, capítulo, seção) em metadados
- ✅ **Markdown puro + frontmatter YAML**: legível por humanos, por qualquer linguagem e por IA
- ✅ **Histórico no Git**: `git log` e `git diff` mostram como cada artigo mudou
- ✅ **Domínio público (CC0)**: use em qualquer projeto, inclusive comercial, sem pedir permissão

> **Lei é código que roda na sociedade. Então por que não versioná-la como código?**

---

## 📦 O que tem aqui

| Norma | Apelido | Pasta | Status |
|---|---|---|---|
| Constituição Federal de 1988 (inclui o ADCT) | `cf88` | [`normas/constituicao-1988/`](normas/constituicao-1988/_norma.md) | ✅ disponível (424 artigos) |
| Consolidação das Leis do Trabalho (Decreto-Lei nº 5.452/1943) | `clt` | [`normas/decreto-lei-5452-1943/`](normas/decreto-lei-5452-1943/_norma.md) | ✅ disponível (1.027 artigos) |
| Código de Defesa do Consumidor (Lei nº 8.078/1990) | `cdc` | [`normas/lei-8078-1990/`](normas/lei-8078-1990/_norma.md) | ✅ disponível (130 artigos) |
| Estatuto da Criança e do Adolescente (Lei nº 8.069/1990) | `eca` | [`normas/lei-8069-1990/`](normas/lei-8069-1990/_norma.md) | ✅ disponível (329 artigos) |
| Lei de Benefícios da Previdência Social (Lei nº 8.213/1991) | — | `normas/lei-8213-1991/` | 📋 planejado |
| Lei do Inquilinato (Lei nº 8.245/1991) | — | `normas/lei-8245-1991/` | 📋 planejado |
| Código Civil (Lei nº 10.406/2002) | `cc` | `normas/lei-10406-2002/` | 📋 planejado |
| Código Penal (Decreto-Lei nº 2.848/1940) | `cp` | `normas/decreto-lei-2848-1940/` | 📋 planejado |
| Código de Trânsito Brasileiro (Lei nº 9.503/1997) | `ctb` | `normas/lei-9503-1997/` | 📋 planejado |

Sentiu falta de alguma lei? [Abra uma issue](../../issues) pedindo.

### Escopo

Este repositório reúne a **legislação federal brasileira em vigor**, no texto consolidado.

| Tipo de norma | Incluído? |
|---|---|
| Constituição Federal e ADCT | ✅ sim |
| Códigos e estatutos | ✅ sim, com prioridade |
| Leis complementares e ordinárias | ✅ sim, adicionadas aos poucos (as mais usadas primeiro) |
| Decretos-lei em vigor | ✅ sim |
| Decretos regulamentares | ⏳ futuramente, os mais relevantes |
| Medidas provisórias | ⏳ futuramente (têm vigência temporária) |
| Emendas constitucionais | ➖ não como arquivo próprio: o efeito delas aparece no texto da Constituição e no histórico do Git |
| Portarias, resoluções e instruções normativas | ❌ não |
| Leis estaduais e municipais | ❌ não, por enquanto |
| Súmulas e jurisprudência | ❌ não (não são lei) |

---

## 🗂️ Estrutura do repositório

```
legislacao-br/
├─ normas/
│  ├─ constituicao-1988/
│  │  ├─ _norma.md        ← metadados da norma (nome, apelidos, data, fonte, estrutura)
│  │  ├─ preambulo.md
│  │  ├─ art-001.md
│  │  ├─ art-005.md
│  │  ├─ art-103-a.md     ← artigos acrescidos por emenda mantêm a letra
│  │  ├─ ...
│  │  └─ adct-art-001.md  ← artigos do ADCT, na mesma pasta
│  ├─ decreto-lei-5452-1943/   (CLT)
│  └─ lei-8078-1990/           (CDC)
├─ CONTRIBUTING.md
├─ LICENSE               ← CC0 1.0 (domínio público)
└─ README.md
```

### Nome das pastas: identificador oficial, não apelido

Cada norma fica em uma pasta com o nome **`{tipo}-{número}-{ano}`**, seguindo a mesma lógica do [LexML](https://www.lexml.gov.br/):

| Norma | Pasta |
|---|---|
| Constituição Federal de 1988 | `constituicao-1988` |
| Lei nº 8.078, de 1990 | `lei-8078-1990` |
| Lei Complementar nº 123, de 2006 | `lei-complementar-123-2006` |
| Decreto-Lei nº 5.452, de 1943 | `decreto-lei-5452-1943` |
| Decreto nº 3.048, de 1999 | `decreto-3048-1999` |

Assim o nome é **único e previsível**: quem sabe o número da lei encontra a pasta sem consultar nada. Os nomes populares ("CDC", "CLT", "Código de Defesa do Consumidor") ficam no campo `apelidos` do `_norma.md` e na tabela [O que tem aqui](#-o-que-tem-aqui).

### Nome dos arquivos

**Por que as pastas são planas, sem subpastas por título e capítulo?** Porque o número do artigo é estável e a hierarquia, não. Uma emenda pode mover ou criar seções, mas `art-196.md` continua sendo o Art. 196. A hierarquia completa fica no frontmatter de cada arquivo.

| Dispositivo | Arquivo |
|---|---|
| Art. 5º | `art-005.md` |
| Art. 196 | `art-196.md` |
| Art. 103-A | `art-103-a.md` |
| Art. 1º do ADCT | `adct-art-001.md` |
| Preâmbulo | `preambulo.md` |
| Metadados da norma | `_norma.md` |

O número tem zeros à esquerda (três dígitos, ou quatro em leis com mais de 999 artigos), para que `ls` liste os arquivos na ordem certa.

---

## 📄 Formato dos arquivos

Cada artigo é um arquivo Markdown com **frontmatter YAML** (os metadados) e o **texto oficial** logo abaixo. Este é o [`art-006.md`](normas/constituicao-1988/art-006.md) da Constituição:

```markdown
---
id: constituicao-1988-art-006
norma: constituicao-1988
artigo: "6"
rotulo: Art. 6º
hierarquia:
  titulo: Título II – Dos Direitos e Garantias Fundamentais
  capitulo: Capítulo II – Dos Direitos Sociais
fonte: https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm
capturado_em: 2026-10-22
revogado: false
notas:
  - dispositivo: caput
    texto: Redação dada pela Emenda Constitucional nº 90, de 2015
  - dispositivo: par-unico
    texto: Incluído pela Emenda Constitucional nº 114, de 2021
---

# Art. 6º

São direitos sociais a educação, a saúde, a alimentação, o trabalho, a moradia, o transporte, o lazer, a segurança, a previdência social, a proteção à maternidade e à infância, a assistência aos desamparados, na forma desta Constituição.

## <a id="par-unico"></a>Parágrafo único

Todo brasileiro em situação de vulnerabilidade social terá direito a uma renda básica familiar, ...
```

### Campos do frontmatter

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | Identificador único e estável: `{norma}-{nome do arquivo}`, por exemplo `constituicao-1988-art-005` ou `constituicao-1988-adct-art-001` |
| `norma` | string | Nome da pasta da norma (`constituicao-1988`, `lei-8078-1990`…) |
| `artigo` | string | Número do artigo, como texto (por causa de `103-A`) |
| `rotulo` | string | Como o artigo é citado: `Art. 5º`, `Art. 103-A`, `Art. 1º do ADCT` |
| `hierarquia` | objeto | `titulo`, `capitulo`, `secao`, `subsecao` (só os que existirem) |
| `fonte` | URL | Página oficial de onde o texto foi capturado |
| `capturado_em` | data | Data da captura (ISO 8601) |
| `revogado` | boolean | `true` se o artigo inteiro foi revogado (o arquivo é mantido) |
| `notas` | lista | Notas oficiais de alteração, cada uma com o `dispositivo` a que se refere (`caput` ou a âncora, como `inc-4`) e o `texto` (*"Redação dada pela Emenda Constitucional nº 90, de 2015"*, *"Incluído pela…"*, *"Vide…"*) |

### Estrutura interna do artigo

Os dispositivos são cabeçalhos com **âncoras estáveis**, para que você possa linkar direto para um inciso. Os incisos e alíneas ficam aninhados sob o parágrafo ou inciso a que pertencem:

```markdown
# Art. 5º

Todos são iguais perante a lei, sem distinção de qualquer natureza, ...

## <a id="inc-1"></a>Inciso I

homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição;

## <a id="inc-28"></a>Inciso XXVIII

são assegurados, nos termos da lei:

### <a id="inc-28-al-a"></a>Alínea a

a proteção às participações individuais em obras coletivas ...

## <a id="par-1"></a>§ 1º

As normas definidoras dos direitos e garantias fundamentais têm aplicação imediata.
```

| Dispositivo | Âncora |
|---|---|
| Inciso III | `#inc-3` |
| Inciso II-A | `#inc-2-a` |
| § 2º | `#par-2` |
| § 4º-A | `#par-4-a` |
| Parágrafo único | `#par-unico` |
| Alínea "a" do inciso XXVIII | `#inc-28-al-a` |
| Inciso I do § 3º | `#par-3-inc-1` |

Dispositivos revogados continuam no arquivo, com o corpo `*(Revogado)*` e a nota de revogação em `notas`, para que âncoras e links não quebrem.

### Metadados da norma (`_norma.md`)

Cada pasta tem um `_norma.md` com os dados da norma e um **índice navegável** por título e capítulo, com links para todos os artigos ([veja o da Constituição](normas/constituicao-1988/_norma.md)):

```markdown
---
norma: constituicao-1988
tipo: constituicao
nome: Constituição da República Federativa do Brasil de 1988
data: 1988-10-05
apelidos:
  - cf88
  - CF/88
  - Constituição Federal
  - Constituição Cidadã
fonte: https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm
capturado_em: 2026-10-22
artigos:
  principal: 276
  adct: 148
---

# Constituição da República Federativa do Brasil de 1988

[Preâmbulo](preambulo.md)

## Título I – Dos Princípios Fundamentais

[Art. 1º](art-001.md) · [Art. 2º](art-002.md) · [Art. 3º](art-003.md) · [Art. 4º](art-004.md)
```

---

## 🚀 Como usar

### Clonar

```bash
git clone https://github.com/Evaldoes/legislacao-br.git
cd legislacao-br
```

### Buscar no terminal

```bash
# Em quais artigos da Constituição aparece "saúde"?
grep -ril "saúde" normas/constituicao-1988/

# Ler um artigo
cat normas/constituicao-1988/art-005.md
```

### Ver como um artigo mudou ao longo do tempo

```bash
git log --follow -p normas/constituicao-1988/art-007.md
```

### Python

```python
import pathlib
import frontmatter  # pip install python-frontmatter

for path in sorted(pathlib.Path("normas/constituicao-1988").glob("art-*.md")):
    artigo = frontmatter.load(path)
    print(artigo["rotulo"], "—", artigo["hierarquia"].get("titulo"))
```

### JavaScript / TypeScript

```ts
import { readFileSync, readdirSync } from "node:fs";
import matter from "gray-matter"; // npm i gray-matter

const dir = "normas/constituicao-1988";
const artigos = readdirSync(dir)
  .filter((f) => f.startsWith("art-"))
  .map((f) => matter(readFileSync(`${dir}/${f}`, "utf8")));

console.log(artigos.length, "artigos carregados");
```

### Direto do GitHub, sem clonar

```bash
curl https://raw.githubusercontent.com/Evaldoes/legislacao-br/main/normas/constituicao-1988/art-196.md
```

---

## 🤖 Usando com IA (LLMs, RAG e agentes)

Este repositório foi pensado para ser **amigável a modelos de linguagem**:

- **Um artigo por arquivo** já é um *chunk* natural para RAG. Não é preciso quebrar o texto em pedaços arbitrários.
- **O frontmatter vira metadado de busca.** Filtre por `norma`, `hierarquia.titulo`, `revogado` ou `notas` no seu banco vetorial.
- **O `id` é estável.** Use-o para citar a fonte nas respostas (por exemplo, *"conforme constituicao-1988-art-196"*) e reduzir alucinações.
- **Markdown limpo, sem trechos revogados e com as notas fora do texto**, gasta menos tokens e dá menos ruído para o modelo.

Ideias do que construir:

- 💬 Chatbots que respondem dúvidas citando o artigo exato
- 📝 Geração de explicações em linguagem simples (sempre com revisão humana!)
- 🔎 Busca semântica na legislação
- 📊 Análises: quais artigos mais mudaram? Quais emendas mexeram em mais artigos?
- 🎓 Quizzes e material didático para escolas e concursos

> ⚠️ **Atenção:** modelos de IA podem errar ao interpretar a lei. Use este repositório como **fonte do texto**, nunca como substituto de orientação jurídica.

---

## ⚙️ Como o texto é gerado

O texto não é digitado: ele é **capturado** do Planalto por um programa que está neste mesmo repositório, em [`ingestion/`](ingestion/). Qualquer pessoa pode rodar, conferir e melhorar.

```bash
npm install
npm run ingest -- constituicao-1988 --out normas      # baixa do Planalto e atualiza normas/constituicao-1988
npm test                                              # testes do parser
```

O programa:

1. baixa a página oficial (que vem em ISO-8859-1) e separa os parágrafos;
2. reconhece títulos, capítulos, seções, artigos, parágrafos, incisos e alíneas;
3. remove os trechos **riscados** (revogados) e os de **medidas provisórias que perderam a validade** ("Vigência encerrada"), e move as notas de alteração para o campo `notas`;
4. escreve um arquivo por artigo, o `_norma.md` com o índice e o `preambulo.md`;
5. **aborta** se encontrar artigos faltando na numeração ou dispositivos fora de lugar.

Toda mudança passa pela **validação automática** (`npm run check`), que roda no GitHub em cada push e pull request: frontmatter completo, `id` coerente com o nome do arquivo, âncoras e ids sem repetição, notas apontando para dispositivos que existem, índice sem links quebrados e nenhum artigo faltando na numeração.

**Atualização automática:** toda segunda-feira, o GitHub Actions captura de novo todas as normas. Se o Planalto mudou alguma coisa, abre um pull request com o diff, os artigos alterados e as emendas citadas nas notas novas (por exemplo, "constituicao-1988: atualização do Planalto (EC 141/2026)"). Uma pessoa revisa antes de juntar. Para capturar tudo na sua máquina: `npm run ingest:all`.

Um arquivo só muda quando o **conteúdo** muda: capturar de novo uma lei que não mudou não altera nada, nem a data `capturado_em`. Assim, o histórico do Git mostra só as mudanças reais da lei.

Para adicionar uma norma, crie `ingestion/laws/{pasta}.ts` com a URL do Planalto, a descrição e os marcadores de início e fim do texto (veja [`constituicao-1988.ts`](ingestion/laws/constituicao-1988.ts)) e registre em `ingestion/laws/index.ts`.

---

## 🔍 Fidelidade e fonte

- O texto é capturado **automaticamente** do [Portal da Legislação do Planalto](https://www.planalto.gov.br/legislacao), a publicação oficial consolidada do Governo Federal, pelo programa em [`ingestion/`](ingestion/).
- Os trechos **revogados** (que aparecem riscados no site) são removidos. O texto **em vigor** é mantido.
- Medidas provisórias que **perderam a validade** (marcadas no Planalto com "Vigência encerrada") não contam: o que elas incluíram, mudaram ou revogaram fica de fora, assim como as notas delas.
- Na CLT, o decreto que a aprova e o quadro anexo do Art. 577 (enquadramento sindical) não foram incluídos. Tabelas dentro de artigos (como a do Art. 580) aparecem como linhas de texto.
- As notas de alteração, como *"(Redação dada pela Emenda Constitucional nº 26, de 2000)"*, saem do corpo do texto e vão para o campo `notas`, indicando o dispositivo a que se referem.
- **Este repositório não é uma publicação oficial.** Em caso de divergência, vale o texto publicado no Diário Oficial da União. Encontrou uma diferença? [Abra uma issue](../../issues).

---

## 🤝 Como contribuir

Contribuições são muito bem-vindas! Algumas formas de ajudar:

- 🐛 **Reportar divergências** entre um arquivo e o texto oficial
- 📚 **Pedir ou ajudar a adicionar** novas leis
- ✍️ **Melhorar a documentação** e os exemplos de uso
- ⭐ **Dar uma estrela**, que ajuda outras pessoas a encontrarem o projeto

Leia o [CONTRIBUTING.md](CONTRIBUTING.md) antes de abrir um pull request.

---

## 🌎 Projetos relacionados

- [**legalize-dev**](https://github.com/legalize-dev/legalize): a mesma ideia ("cada lei um arquivo Markdown, cada reforma um commit") para Espanha, Portugal, Itália, Argentina, UE, EUA e outros países. Uma inspiração direta.
- [**LexML Brasil**](https://www.lexml.gov.br/): rede de informação legislativa e jurídica, com identificadores padronizados (URN LEX).
- [**Portal da Legislação (Planalto)**](https://www.planalto.gov.br/legislacao): fonte oficial do texto consolidado.
- [**Dados Abertos da Câmara**](https://dadosabertos.camara.leg.br/) e [**do Senado**](https://www12.senado.leg.br/dados-abertos): APIs sobre o processo legislativo.

---

## ❓ Perguntas frequentes

<details>
<summary><b>Posso usar isto em um produto comercial?</b></summary>

Sim. O conteúdo está em domínio público (CC0). Além disso, os textos de leis não são protegidos por direito autoral no Brasil (Lei nº 9.610/1998, art. 8º, IV). Não é necessário pedir permissão, mas citar o projeto ajuda muito.
</details>

<details>
<summary><b>Por que Markdown e não JSON ou XML?</b></summary>

Porque Markdown é legível por **pessoas** (no próprio GitHub, sem nenhuma ferramenta), produz diffs claros no Git e é lido facilmente por qualquer linguagem e por modelos de IA. Converter para JSON é uma linha de código. O contrário não é.
</details>

<details>
<summary><b>Com que frequência os textos são atualizados?</b></summary>

Sempre que uma nova emenda ou lei alteradora é publicada e consolidada pelo Planalto. Cada atualização vira um commit que diz qual norma provocou a mudança.
</details>

<details>
<summary><b>Os artigos revogados somem?</b></summary>

Não. O arquivo do artigo continua existindo com `revogado: true` e o corpo `*(Revogado)*`, para que links e referências não quebrem. O mesmo vale para um inciso, parágrafo ou alínea revogado dentro de um artigo em vigor. Já as **redações antigas** (que o Planalto mostra riscadas) não entram no texto: elas ficam no histórico do Git a partir da primeira captura.
</details>

<details>
<summary><b>Vai ter leis estaduais e municipais?</b></summary>

Por enquanto, não. O foco é a legislação **federal**. São 27 estados e mais de 5.500 municípios, cada um com seu próprio site e formato. Se um dia entrarem, terão um prefixo próprio (por exemplo, `normas/sp/...`) para não se misturar com as normas federais.
</details>

<details>
<summary><b>Por que a pasta se chama <code>lei-8078-1990</code> e não <code>cdc</code>?</b></summary>

Porque a maioria das leis não tem apelido, e apelidos podem ser ambíguos. O formato `{tipo}-{número}-{ano}` é único para qualquer norma e é previsível para quem já sabe o número. Os apelidos ficam registrados no `_norma.md` de cada pasta.
</details>

<details>
<summary><b>Tem explicações em linguagem simples?</b></summary>

Não. Este repositório contém **somente o texto oficial**, de propósito: ele é uma base neutra e confiável para que qualquer projeto construa sua própria camada por cima.
</details>

---

## 📜 Licença

[**CC0 1.0 Universal**](LICENSE): domínio público. Faça o que quiser com este conteúdo.

O texto das normas é de domínio público por natureza (Lei nº 9.610/1998, art. 8º, IV). A organização, a estrutura e os metadados deste repositório também são dedicados ao domínio público pela CC0.

---

## 🌐 English

**legislacao-br** is Brazilian federal legislation as Markdown files, version-controlled with Git. Each article is a file and each constitutional amendment is a commit.

- Source: the official consolidated texts at [planalto.gov.br](https://www.planalto.gov.br/legislacao)
- Format: Markdown with YAML frontmatter (hierarchy, amendments, source URL)
- Scope: **federal legislation in force** (Constitution, codes, statutes, complementary and ordinary laws). State/municipal laws are out of scope for now
- One folder per law, named by its official identifier (`lei-8078-1990`), with popular nicknames (`cdc`) in metadata
- Starting with the **Brazilian Federal Constitution of 1988**, with the Labor Code (CLT), Consumer Code (CDC) and others to follow
- Built for developers, researchers, journalists and **AI/RAG pipelines**
- License: **CC0 1.0** (public domain)

Inspired by [legalize-dev](https://github.com/legalize-dev/legalize). Contributions are welcome!

---

<div align="center">

**Se este projeto te ajudou, deixe uma ⭐ e compartilhe com outros devs.**

<sub>
constituição federal · legislação brasileira · leis em markdown · direito aberto · dados abertos ·
open data · brazilian law · constitution · legal tech · lawtech · civic tech · rag · llm
</sub>

</div>
