import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/genres", response_model=list[schemas.GenreOut])
def list_genres(db: Session = Depends(get_db)):
    return db.query(models.Genre).all()


@router.get("/genres/{genre_id}/random", response_model=schemas.PairingOut)
def random_pairing(genre_id: str, db: Session = Depends(get_db)):
    pairings = db.query(models.Pairing).filter(models.Pairing.genre_id == genre_id).all()
    if not pairings:
        raise HTTPException(status_code=404, detail="No pairings for this genre yet")
    return random.choice(pairings)
