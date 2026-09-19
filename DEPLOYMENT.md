# Hearthline deployment

The production architecture is:

```text
Netlify frontend -> Render API -> PostgreSQL provider
```

## 1. PostgreSQL

Create a PostgreSQL database with Neon, Supabase, Railway, Render, or another provider.
Run `backend/schema.sql` against that database and copy its connection string.

Required database environment variable:

```env
DATABASE_URL=postgresql://username:password@host:5432/hearthline
DATABASE_SSL=true
```

## 2. Backend on Render

The repository includes `render.yaml` for the Express service.

- Build command: `npm install`
- Start command: `npm start`
- Health check: `/api/health`
- Root backend entry: `backend/server.js`

Set these Render environment variables:

```env
DATABASE_URL=<your PostgreSQL connection string>
DATABASE_SSL=true
FRONTEND_URL=https://<your-netlify-site>.netlify.app
NODE_ENV=production
```

After deployment, verify:

```text
https://<your-render-service>.onrender.com/api/health
```

## 3. Frontend on Netlify

Deploy the repository to Netlify. `netlify.toml` publishes the project root, including `index.html`, `styles.css`, and `app.js`.

The backend URL must be used by frontend API requests in production:

```js
const API_BASE_URL = 'https://<your-render-service>.onrender.com';
```

Configure CORS on Render with the exact Netlify URL in `FRONTEND_URL`.

## API routes

- `GET /api/health`
- `GET /api/workspaces`
- `GET /api/workspaces/:workspaceId`
- `GET /api/workspaces/:workspaceId/tickets`
- `POST /api/workspaces/:workspaceId/tickets`
- `GET /api/workspaces/:workspaceId/tickets/:ticketId`
- `GET /api/analytics?workspace=cafe`
