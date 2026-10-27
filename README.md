# Loja Compre Bem — App

App em Expo (React Native) que lista os produtos da API Spring Boot da Loja Compre Bem.

## Como rodar

1. Suba a API Spring Boot (porta 8080).
2. Copie `.env.example` para `.env.local` e ajuste `EXPO_PUBLIC_API_URL` com o IP do computador que roda a API.
3. Instale e inicie:

```bash
npm install
npx expo start
```

## Integração com a API

A listagem chama `GET /api/v1/produtos?page={n}&size=20[&filtro={texto}]` e exibe o array `content` da resposta paginada do Spring (`Page<Produto>`).

- A próxima página é carregada ao chegar no fim da lista (`onEndReached`) até a API indicar a última página (`last` ou `totalPages`).
- A busca é enviada no parâmetro `filtro` e recomeça da página 0.
- Puxar a lista para baixo recarrega a primeira página.
- Há indicador de carregamento, mensagem de lista vazia e mensagem de erro com botão "Tentar novamente".

Para rodar no navegador (`expo start --web`), a API precisa liberar CORS (por exemplo, `@CrossOrigin` no controller).
