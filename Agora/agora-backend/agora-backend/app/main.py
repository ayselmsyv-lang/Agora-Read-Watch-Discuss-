import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth, debates, dice, recommendations, tickets, titles

# For a real project, replace this with Alembic migrations.
# This is fine for local development and getting started quickly.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agora API", version="0.1.0")

origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(debates.router)
app.include_router(dice.router)
app.include_router(recommendations.router)
app.include_router(tickets.router)
app.include_router(titles.router)


@app.get("/health")
def health():
    return {"status": "ok"}
