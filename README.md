# íTech Store

Projeto React + Node.js criado a partir do `loja.html`.

## Estrutura

- `frontend/`: frontend em React com Vite.
- `frontend/src/App.jsx`: componente principal da aplicação.
- `frontend/src/components/`: componentes da tela inicial.
- `backend/`: API em Node.js/Express.
- `backend/data/itech.sqlite`: banco SQLite local criado pelo comando de seed.

## Rodando

```bash
npm install
npm run seed
npm run dev
```

Depois acesse:

- Frontend: http://localhost:5173
- API: http://localhost:4000/api/home

## Scripts úteis

```bash
npm run build
npm start
```

`npm start` serve a API e, se `frontend/dist` existir, também entrega o frontend compilado.
