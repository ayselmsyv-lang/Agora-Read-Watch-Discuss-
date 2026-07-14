from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

from .models import DebateChoice, DiceChoice, TicketStatus, TitleType


# ---------- Auth / Users ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    favorite_genre: Optional[str] = None


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    favorite_genre: Optional[str] = None

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Debates ----------
class DebateQuestionOut(BaseModel):
    id: str
    tag: str
    question_text: str

    class Config:
        from_attributes = True


class DebateVoteIn(BaseModel):
    choice: DebateChoice


class DebateResults(BaseModel):
    question_id: str
    agree: int
    disagree: int
    total: int


# ---------- Dice / This or That ----------
class DicePairOut(BaseModel):
    id: str
    option_a: str
    option_b: str

    class Config:
        from_attributes = True


class DiceVoteIn(BaseModel):
    choice: DiceChoice


# ---------- Recommendations ----------
class GenreOut(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True


class PairingOut(BaseModel):
    id: str
    book_title: str
    book_note: str
    film_title: str
    film_note: str

    class Config:
        from_attributes = True


# ---------- Titles & Feedback ----------
class TitleOut(BaseModel):
    id: str
    type: TitleType
    name: str
    genre: str
    blurb: str

    class Config:
        from_attributes = True


class TitleSummary(TitleOut):
    avg_rating: float
    rating_count: int


class FeedbackIn(BaseModel):
    stars: int  # 1-5, validated in the route
    comment: str
    display_name: Optional[str] = None  # used only if the request is unauthenticated


class FeedbackOut(BaseModel):
    id: str
    stars: str
    comment: str
    display_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Tickets ----------
class TicketCreate(BaseModel):
    subject: str
    category: str
    message: str


class TicketOut(BaseModel):
    id: str
    subject: str
    category: str
    message: str
    status: TicketStatus
    created_at: datetime

    class Config:
        from_attributes = True


class TicketStatusUpdate(BaseModel):
    status: TicketStatus
