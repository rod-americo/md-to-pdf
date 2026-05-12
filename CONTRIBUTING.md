# Contribuindo

Este projeto é pequeno e intencionalmente simples. A prioridade é manter o gerador previsível, fácil de clonar e fácil de adaptar localmente.

## Escopo versionado

O repositório versiona apenas:

- o gerador em `src/`;
- os templates públicos `whitelabel` e `blacklabel`;
- exemplos mínimos em `examples/`;
- documentação e configuração.

Não devem entrar no Git:

- documentos reais de entrada (`input/`);
- arquivos gerados (`dist/`);
- assets privados de marcas (`assets/`);
- templates privados (`src/local-templates.js`);
- CSS de templates privados.

## Como testar

Depois de instalar dependências:

```bash npm install npm run smoke
```

Para testar a geração completa de PDF:

```bash
npm run pdf -- whitelabel examples/minimal.md
npm run pdf -- blacklabel examples/minimal.md
```

Se o Playwright reclamar da ausência do navegador:

```bash npx playwright install chromium
```

## Templates locais

Templates privados devem ficar em `src/local-templates.js`, que é ignorado pelo
Git. Use `docs/local-templates.example.js` como referência.

Ao criar templates locais, mantenha os assets e CSS correspondentes fora do
versionamento, a menos que eles sejam públicos e realmente devam fazer parte do
projeto.

## Pull requests

Antes de abrir um PR:

```bash
npm run smoke
```

Mantenha mudanças pequenas e objetivas. Para alterações visuais, inclua no PR uma descrição do impacto no HTML/PDF gerado.
