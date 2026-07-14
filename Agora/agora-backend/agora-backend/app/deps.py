from typing import Optional

from fastapi import Depends, HTTPException, Header, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import get_db
from .security import decode_access_token
from . import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_id = decode_access_token(token)
    if user_id is None:
        raise credentials_error
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_error
    return user


def get_optional_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> Optional[models.User]:
    """Like get_current_user, but returns None instead of raising when there's
    no token — used for feedback, which is allowed anonymously."""
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    user_id = decode_access_token(token)
    if not user_id:
        return None
    return db.query(models.User).filter(models.User.id == user_id).first()
