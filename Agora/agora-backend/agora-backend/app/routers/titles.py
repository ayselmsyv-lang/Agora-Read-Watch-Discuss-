from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_optional_user

router = APIRouter(prefix="/titles", tags=["titles"])


def _summary(db: Session, title: models.Title) -> schemas.TitleSummary:
    rows = db.query(models.Feedback).filter(models.Feedback.title_id == title.id).all()
    count = len(rows)
    avg = (sum(int(r.stars) for r in rows) / count) if count else 0.0
    return schemas.TitleSummary(
        id=title.id, type=title.type, name=title.name, genre=title.genre,
        blurb=title.blurb, avg_rating=round(avg, 2), rating_count=count,
    )


@router.get("", response_model=list[schemas.TitleSummary])
def list_titles(
    type: Optional[str] = None,
    genre: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.Title)
    if type:
        q = q.filter(models.Title.type == type)
    if genre:
        q = q.filter(models.Title.genre == genre)
    return [_summary(db, t) for t in q.all()]


@router.get("/{title_id}", response_model=schemas.TitleSummary)
def get_title(title_id: str, db: Session = Depends(get_db)):
    title = db.query(models.Title).filter(models.Title.id == title_id).first()
    if not title:
        raise HTTPException(status_code=404, detail="Title not found")
    return _summary(db, title)


@router.get("/{title_id}/feedback", response_model=list[schemas.FeedbackOut])
def list_feedback(title_id: str, db: Session = Depends(get_db)):
    return (
        db.query(models.Feedback)
        .filter(models.Feedback.title_id == title_id)
        .order_by(models.Feedback.created_at.desc())
        .all()
    )


@router.post("/{title_id}/feedback", response_model=schemas.FeedbackOut, status_code=201)
def add_feedback(
    title_id: str,
    payload: schemas.FeedbackIn,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_user),
):
    title = db.query(models.Title).filter(models.Title.id == title_id).first()
    if not title:
        raise HTTPException(status_code=404, detail="Title not found")
    if not (1 <= payload.stars <= 5):
        raise HTTPException(status_code=400, detail="stars must be between 1 and 5")

    feedback = models.Feedback(
        title_id=title_id,
        user_id=current_user.id if current_user else None,
        display_name=current_user.name if current_user else (payload.display_name or "Anonymous"),
        stars=str(payload.stars),
        comment=payload.comment,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback
