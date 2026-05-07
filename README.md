# Markdown para PDF

Gerador de PDF a partir de Markdown com selecao de template por linha de comando.

## Uso

```bash
npm install
node src/md-to-pdf.js whitelabel input/nome_do_md.md
node src/md-to-pdf.js blacklabel input/nome_do_md.md
```

Por padrao, os arquivos sao gerados em `dist/<template>-<nome>.html` e `dist/<template>-<nome>.pdf`.

## Opcoes

- `-o, --output`: caminho do PDF de saida.
- `--html`: caminho do HTML intermediario.
- `--no-pdf`: gera apenas o HTML.

Exemplo:

```bash
node src/md-to-pdf.js blacklabel input/poc-sentinel.md --html dist/blacklabel-poc-sentinel.html -o dist/blacklabel-poc-sentinel.pdf
```

Para gerar os exemplos versionados com a POC Sentinel:

```bash
npm run build:examples
```

## Templates

- `whitelabel`: template neutro para uso generico.
- `blacklabel`: template neutro escuro.

## Templates locais

Templates privados ou experimentais podem ficar em `src/local-templates.js`.
Esse arquivo e ignorado pelo Git e deve exportar um objeto no mesmo formato dos
templates internos. Os CSS/assets correspondentes tambem devem permanecer fora
do versionamento.
