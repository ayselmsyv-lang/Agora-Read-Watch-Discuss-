from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.post("", response_model=schemas.TicketOut, status_code=201)
def create_ticket(
    payload: schemas.TicketCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ticket = models.Ticket(
        user_id=current_user.id,
        subject=payload.subject,
        category=payload.category,
        message=payload.message,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("", response_model=list[schemas.TicketOut])
def list_my_tickets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Ticket)
        .filter(models.Ticket.user_id == current_user.id)
        .order_by(models.Ticket.created_at.desc())
        .all()
    )


@router.patch("/{ticket_id}/status", response_model=schemas.TicketOut)
def update_status(
    ticket_id: str,
    payload: schemas.TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ticket = (
        db.query(models.Ticket)
        .filter(models.Ticket.id == ticket_id, models.Ticket.user_id == current_user.id)
        .first()
    )
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = payload.status
    db.commit()
    db.refresh(ticket)
    return ticket
