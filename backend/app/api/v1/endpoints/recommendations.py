from fastapi import APIRouter, Query
from typing import List
from backend.app.models.track import Track
from backend.app.adapters.music_provider import PermittedCreativeCommonsProvider
from backend.app.services.recommendation import ContentBasedRecommender

router = APIRouter()
provider = PermittedCreativeCommonsProvider()
recommender = ContentBasedRecommender()


@router.get("/recommendations/personalized", response_model=List[Track])
async def get_personalized_recommendations(
    limit: int = Query(10, ge=1, le=50),
):
    """
    Returns personalized recommended tracks based on user interaction history.
    """
    all_tracks = await provider.get_trending(limit=50)
    recommender.fit(all_tracks)

    # In production, user_history is retrieved from the pseudonymous user profile/redis
    mock_user_history = ["trk_cc_01"]
    recommendations = recommender.recommend(
        user_id="anon_session_default",
        user_history=mock_user_history,
        candidate_tracks=all_tracks,
        limit=limit,
    )
    return recommendations
