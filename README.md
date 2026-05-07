# Markdown para PDF

Gerador de PDF a partir de Markdown com selecao de template por linha de comando.

## Uso

```bash
npm install
npm run pdf -- whitelabel caminho/documento.md
npm run pdf -- blacklabel caminho/documento.md
```

Por padrao, os arquivos sao gerados em `dist/<template>-<nome>.html` e `dist/<template>-<nome>.pdf`.

## Opcoes

- `-o, --output`: caminho do PDF de saida.
- `--html`: caminho do HTML intermediario.
- `--no-pdf`: gera apenas o HTML.

Exemplo:

```bash
npm run pdf -- blacklabel caminho/documento.md --html dist/blacklabel-documento.html -o dist/blacklabel-documento.pdf
```

## Templates

- `whitelabel`: template neutro para uso generico.
- `blacklabel`: template neutro escuro.

## Templates locais

Entradas Markdown ficam fora do Git por padrao (`input/` e ignorado). Templates
privados ou experimentais podem ficar em `src/local-templates.js`. Esse arquivo
e ignorado pelo Git e deve exportar um objeto no mesmo formato dos templates
internos. Os CSS/assets correspondentes tambem devem permanecer fora do
versionamento.
