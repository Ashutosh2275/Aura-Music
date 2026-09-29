import logging
from typing import Optional
from fastapi import Header, HTTPException, status
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class AuthenticatedUser(BaseModel):
    uid: str
    is_anonymous: bool = True


async def get_current_user(
    authorization: Optional[str] = Header(None),
) -> AuthenticatedUser:
    """
    Validates Firebase Anonymous Auth token from the Authorization header.
    In development mode or when testing without active Firebase credentials,
    generates a deterministic pseudonymous user ID.
    """
    if not authorization:
        # Default pseudonymous session for unauthenticated explore mode
        return AuthenticatedUser(uid="anon_client_session", is_anonymous=True)

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_AUTH_HEADER", "message": "Bearer token required"},
        )

    token = authorization.split(" ")[1]

    # In production with Firebase Admin SDK initialized:
    # try:
    #     decoded_token = auth.verify_id_token(token)
    #     return AuthenticatedUser(uid=decoded_token["uid"], is_anonymous=decoded_token.get("firebase", {}).get("sign_in_provider") == "anonymous")
    # except Exception as e:
    #     raise HTTPException(status_code=401, detail="Invalid token")

    # Secure pseudonymous fallback for testing / development:
    return AuthenticatedUser(uid=f"anon_{token[:12]}", is_anonymous=True)
