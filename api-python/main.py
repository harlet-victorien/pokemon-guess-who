"""FastAPI app for Pokemon Guess Who AI solo mode."""

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="Pokemon Guess Who AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes.game import router as game_router
from routes.turn import router as turn_router
from routes.question import router as question_router

app.include_router(game_router)
app.include_router(turn_router)
app.include_router(question_router)


@app.get("/health")
def health():
    return {"status": "ok"}
