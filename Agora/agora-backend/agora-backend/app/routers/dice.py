import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/dice", tags=["dice"])


@router.get("/random-pair", response_model=schemas.DicePairOut)
def random_pair(db: Session = Depends(get_db)):
    pairs = db.query(models.DicePair).all()
    if not pairs:
        raise HTTPException(status_code=404, detail="No dice pairs seeded yet")
    return random.choice(pairs)


@router.post("/{pair_id}/vote")
def vote_pair(
    pair_id: str,
    payload: schemas.DiceVoteIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pair = db.query(models.DicePair).filter(models.DicePair.id == pair_id).first()
    if not pair:
        raise HTTPException(status_code=404, detail="Pairing not found")

    vote = models.DiceVote(pair_id=pair_id, user_id=current_user.id, choice=payload.choice)
    db.add(vote)
    db.commit()

    a = db.query(models.DiceVote).filter(
        models.DiceVote.pair_id == pair_id, models.DiceVote.choice == models.DiceChoice.a
    ).count()
    b = db.query(models.DiceVote).filter(
        models.DiceVote.pair_id == pair_id, models.DiceVote.choice == models.DiceChoice.b
    ).count()
    return {"pair_id": pair_id, "a": a, "b": b, "total": a + b}
