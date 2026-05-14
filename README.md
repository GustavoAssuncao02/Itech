# íTech Store

Projeto React + Node.js criado a partir do `loja.html`.

## Estrutura

- `frontend/`: frontend em React com Vite.
- `frontend/src/App.jsx`: componente principal da aplicação.
- `frontend/src/components/`: componentes da tela inicial.
- `backend/`: API em Node.js/Express.
- `database/itech_mysql_workbench.sql`: script do banco MySQL usado no Workbench.
- `backend/.env.example`: exemplo de configuracao para conectar o backend ao MySQL.

## Rodando

```bash
npm install
npm run seed
npm run dev
```

Antes de iniciar, crie `backend/.env` com os dados do seu MySQL:

```bash
PORT=4000
CLIENT_ORIGIN=http://localhost:5174
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=itech_store
```

Depois acesse:

- Frontend: http://localhost:5174
- API: http://localhost:4000/api/home

## Scripts úteis

```bash
npm run build
npm start
```

`npm start` serve a API e, se `frontend/dist` existir, também entrega o frontend compilado.
