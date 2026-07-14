import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/debates", tags=["debates"])


@router.get("/random", response_model=schemas.DebateQuestionOut)
def random_debate(db: Session = Depends(get_db)):
    questions = db.query(models.DebateQuestion).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No debate questions seeded yet")
    return random.choice(questions)


@router.get("/{question_id}/results", response_model=schemas.DebateResults)
def debate_results(question_id: str, db: Session = Depends(get_db)):
    agree = db.query(models.DebateVote).filter(
        models.DebateVote.question_id == question_id,
        models.DebateVote.choice == models.DebateChoice.agree,
    ).count()
    disagree = db.query(models.DebateVote).filter(
        models.DebateVote.question_id == question_id,
        models.DebateVote.choice == models.DebateChoice.disagree,
    ).count()
    return schemas.DebateResults(
        question_id=question_id, agree=agree, disagree=disagree, total=agree + disagree
    )


@router.post("/{question_id}/vote", response_model=schemas.DebateResults)
def vote_debate(
    question_id: str,
    payload: schemas.DebateVoteIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    question = db.query(models.DebateQuestion).filter(models.DebateQuestion.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Debate question not found")

    existing = db.query(models.DebateVote).filter(
        models.DebateVote.question_id == question_id,
        models.DebateVote.user_id == current_user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already voted on this question")

    vote = models.DebateVote(question_id=question_id, user_id=current_user.id, choice=payload.choice)
    db.add(vote)
    db.commit()

    return debate_results(question_id, db)
