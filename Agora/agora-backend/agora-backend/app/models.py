import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Text, Boolean, DateTime, ForeignKey, Enum, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .database import Base


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    favorite_genre = Column(String(80), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    debate_votes = relationship("DebateVote", back_populates="user")
    dice_votes = relationship("DiceVote", back_populates="user")
    tickets = relationship("Ticket", back_populates="user")


class DebateQuestion(Base):
    __tablename__ = "debate_questions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    tag = Column(String(60), nullable=False)
    question_text = Column(Text, nullable=False)

    votes = relationship("DebateVote", back_populates="question")


class DebateChoice(str, enum.Enum):
    agree = "agree"
    disagree = "disagree"


class DebateVote(Base):
    __tablename__ = "debate_votes"
    __table_args__ = (UniqueConstraint("user_id", "question_id", name="uq_debate_vote_user_question"),)

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    question_id = Column(UUID(as_uuid=False), ForeignKey("debate_questions.id"), nullable=False)
    choice = Column(Enum(DebateChoice), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="debate_votes")
    question = relationship("DebateQuestion", back_populates="votes")


class DicePair(Base):
    __tablename__ = "dice_pairs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    option_a = Column(String(160), nullable=False)
    option_b = Column(String(160), nullable=False)

    votes = relationship("DiceVote", back_populates="pair")


class DiceChoice(str, enum.Enum):
    a = "a"
    b = "b"


class DiceVote(Base):
    __tablename__ = "dice_votes"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    pair_id = Column(UUID(as_uuid=False), ForeignKey("dice_pairs.id"), nullable=False)
    choice = Column(Enum(DiceChoice), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="dice_votes")
    pair = relationship("DicePair", back_populates="votes")


class Genre(Base):
    __tablename__ = "genres"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(80), unique=True, nullable=False)

    pairings = relationship("Pairing", back_populates="genre")


class Pairing(Base):
    __tablename__ = "pairings"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    genre_id = Column(UUID(as_uuid=False), ForeignKey("genres.id"), nullable=False)
    book_title = Column(String(200), nullable=False)
    book_note = Column(Text, nullable=False)
    film_title = Column(String(200), nullable=False)
    film_note = Column(Text, nullable=False)

    genre = relationship("Genre", back_populates="pairings")


class TitleType(str, enum.Enum):
    book = "book"
    film = "film"


class Title(Base):
    __tablename__ = "titles"

    id = Column(String(80), primary_key=True)  # slug, e.g. "gone-girl"
    type = Column(Enum(TitleType), nullable=False)
    name = Column(String(200), nullable=False)
    genre = Column(String(80), nullable=False)
    blurb = Column(Text, nullable=False)

    feedback = relationship("Feedback", back_populates="title")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    title_id = Column(String(80), ForeignKey("titles.id"), nullable=False)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    display_name = Column(String(120), nullable=True)  # for anonymous feedback
    stars = Column(String(1), nullable=False)  # "1".."5", kept simple on purpose
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    title = relationship("Title", back_populates="feedback")


class TicketStatus(str, enum.Enum):
    open = "open"
    progress = "progress"
    resolved = "resolved"


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    subject = Column(String(200), nullable=False)
    category = Column(String(60), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(Enum(TicketStatus), default=TicketStatus.open, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="tickets")
