from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from backend.app.models.track import Track


class BaseRecommendationEngine(ABC):
    """
    Abstract interface for recommendation algorithms.
    Guarantees recommendation logic remains completely replaceable.
    """

    @abstractmethod
    def fit(self, tracks: List[Track], interaction_matrix: Optional[Any] = None) -> None:
        pass

    @abstractmethod
    def recommend(
        self,
        user_id: str,
        user_history: List[str],
        candidate_tracks: List[Track],
        limit: int = 10,
    ) -> List[Track]:
        pass

    @abstractmethod
    def get_similar_tracks(self, track_id: str, limit: int = 5) -> List[Track]:
        pass


class ContentBasedRecommender(BaseRecommendationEngine):
    """
    Stage 1/2 Content Similarity Engine using Scikit-Learn TF-IDF on genres and tags.
    """

    def __init__(self):
        self.vectorizer = TfidfVectorizer(token_pattern=r"(?u)\b[\w-]+\b")
        self.track_features_matrix = None
        self.track_id_to_idx: Dict[str, int] = {}
        self.idx_to_track: Dict[int, Track] = {}

    def fit(self, tracks: List[Track], interaction_matrix: Optional[Any] = None) -> None:
        if not tracks:
            return

        documents = []
        for idx, track in enumerate(tracks):
            self.track_id_to_idx[track.id] = idx
            self.idx_to_track[idx] = track

            # Build feature text from genre, tags, and artist
            features = (
                track.genre
                + track.tags
                + [track.artist.name.replace(" ", "_")]
            )
            documents.append(" ".join(features))

        self.track_features_matrix = self.vectorizer.fit_transform(documents)

    def recommend(
        self,
        user_id: str,
        user_history: List[str],
        candidate_tracks: List[Track],
        limit: int = 10,
    ) -> List[Track]:
        if not user_history or self.track_features_matrix is None or not candidate_tracks:
            return candidate_tracks[:limit]

        history_indices = [
            self.track_id_to_idx[tid]
            for tid in user_history
            if tid in self.track_id_to_idx
        ]

        if not history_indices:
            return candidate_tracks[:limit]

        user_profile = np.asarray(
            self.track_features_matrix[history_indices].mean(axis=0)
        )

        candidate_indices = [
            self.track_id_to_idx[t.id]
            for t in candidate_tracks
            if t.id in self.track_id_to_idx and t.id not in user_history
        ]

        if not candidate_indices:
            return candidate_tracks[:limit]

        candidate_vectors = self.track_features_matrix[candidate_indices]
        sim_scores = cosine_similarity(user_profile, candidate_vectors).flatten()

        ranked_order = np.argsort(-sim_scores)
        recommended = [
            self.idx_to_track[candidate_indices[idx]]
            for idx in ranked_order[:limit]
        ]
        return recommended

    def get_similar_tracks(self, track_id: str, limit: int = 5) -> List[Track]:
        if self.track_features_matrix is None or track_id not in self.track_id_to_idx:
            return []

        idx = self.track_id_to_idx[track_id]
        track_vec = self.track_features_matrix[idx]
        sim_scores = cosine_similarity(track_vec, self.track_features_matrix).flatten()

        sim_scores[idx] = -1.0  # Exclude self
        ranked = np.argsort(-sim_scores)
        return [self.idx_to_track[i] for i in ranked[:limit] if sim_scores[i] >= 0]
