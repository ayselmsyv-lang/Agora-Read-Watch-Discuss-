# Agora API (FastAPI + PostgreSQL)

Backend for the Agora frontend: auth, debates, this-or-that voting, genre
recommendations, per-title star ratings/feedback, and tickets. (The
emoji-guess game and bingo card are kept client-side — there's nothing
there worth persisting server-side yet.)

## 1. Start Postgres

```bash
docker compose up -d
```

This runs Postgres on `localhost:5432` with user/password/db all set to `agora`.
No Docker? Point `DATABASE_URL` in `.env` at any Postgres instance instead.

## 2. Set up the Python environment

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then edit SECRET_KEY at minimum
```

## 3. Create tables and seed starter content

```bash
python -m app.seed
```

This creates all tables (if they don't exist) and inserts the debate
questions, dice pairs, and genre pairings the frontend expects.

## 4. Run the API

```bash
uvicorn app.main:app --reload
```

Visit `http://localhost:8000/docs` for interactive Swagger docs — the fastest
way to try every endpoint by hand before wiring up the frontend.

## Endpoints

| Method | Path                                 | Auth | Purpose                                  |
|--------|---------------------------------------|------|-------------------------------------------|
| POST   | `/auth/register`                      | no   | Create an account                         |
| POST   | `/auth/login`                         | no   | Get a JWT access token                    |
| GET    | `/auth/me`                            | yes  | Current user's profile                    |
| GET    | `/debates/random`                     | no   | A random debate question                  |
| GET    | `/debates/{id}/results`               | no   | Agree/disagree tallies                    |
| POST   | `/debates/{id}/vote`                  | yes  | Cast a vote (one per user per question)   |
| GET    | `/dice/random-pair`                   | no   | A random this-or-that pairing             |
| POST   | `/dice/{id}/vote`                     | yes  | Vote for option A or B                    |
| GET    | `/recommendations/genres`             | no   | List all genres                           |
| GET    | `/recommendations/genres/{id}/random` | no   | A random book/film pairing for that genre |
| GET    | `/titles`                             | no   | Browse titles (filter by `type`, `genre`) |
| GET    | `/titles/{id}`                        | no   | One title with its average rating         |
| GET    | `/titles/{id}/feedback`               | no   | All feedback for a title                  |
| POST   | `/titles/{id}/feedback`               | optional | Leave a star rating + comment (anonymous allowed) |
| POST   | `/tickets`                            | yes  | Open a ticket                             |
| GET    | `/tickets`                            | yes  | List your own tickets                     |
| PATCH  | `/tickets/{id}/status`                | yes  | Update a ticket's status                  |

Auth uses a standard JWT bearer token. Register, log in, then send
`Authorization: Bearer <token>` on the endpoints marked "yes".

## Connecting the existing frontend

Right now `script.js` in the frontend uses in-memory arrays. To wire it up:

1. Set `API_BASE = "http://localhost:8000"` at the top of `script.js`.
2. Swap the hardcoded `debates`, `pairs`, and `genres` arrays for `fetch()`
   calls to the endpoints above.
3. Store the JWT from `/auth/login` (e.g. in a variable held in memory, or
   `sessionStorage` if you want it to survive a refresh) and attach it as
   an `Authorization` header on vote/ticket requests.
4. Update `CORS_ORIGINS` in `.env` to match wherever you're serving the
   frontend from (e.g. `http://127.0.0.1:5500` for VS Code's Live Server).

## Notes on this scaffold

- Tables are created with `Base.metadata.create_all()` for simplicity. For a
  real project, switch to [Alembic](https://alembic.sqlalchemy.org/) migrations
  once the schema starts changing.
- Passwords are hashed with bcrypt via `passlib`. Never store plaintext.
- One vote per user per debate question is enforced with a unique constraint
  in the database, not just in the frontend.
