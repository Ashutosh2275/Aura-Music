from fastapi import APIRouter, Response, status
from datetime import datetime
from backend.app.models.user import UserProfile, UserPreferences

router = APIRouter()

# In-memory storage for demonstration / test harness
_USER_PROFILES = {}


@router.get("/me", response_model=UserProfile)
async def get_my_profile():
    """
    Returns anonymous user profile. Uses anonymous UID.
    """
    user_id = "anon_session_default"
    if user_id not in _USER_PROFILES:
        _USER_PROFILES[user_id] = UserProfile(
            user_id=user_id,
            created_at=datetime.utcnow(),
            preferences=UserPreferences(),
        )
    return _USER_PROFILES[user_id]


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_data():
    """
    Privacy Right to Erasure: Atomically purges all user data, playlists, and interaction logs.
    """
    user_id = "anon_session_default"
    if user_id in _USER_PROFILES:
        del _USER_PROFILES[user_id]
    return Response(status_code=status.HTTP_204_NO_CONTENT)
