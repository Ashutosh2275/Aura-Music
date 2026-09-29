# Recommendation System Architecture

## 1. Incremental Phased Strategy

To avoid premature complexity and deep learning overhead before interaction density exists, the recommendation system evolves in four deliberate stages:

```
┌────────────────────────────────────────────────────────┐
│ Stage 1: Popularity, Trending & Recency               │
│ - Global and genre-based trending rankings             │
│ - User recently played tracks and repeat-bias          │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Stage 2: Content-Based Similarity                      │
│ - TF-IDF / Feature vectors on genre, tags, tempo, artist│
│ - Cosine similarity neighbor matching                  │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Stage 3: Collaborative Filtering                       │
│ - Implicit feedback matrix factorization               │
│ - Pseudonymous user-track interaction matrix           │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Stage 4: Hybrid Candidate Generation & Ranking         │
│ - Multi-source retrieval (Trending, Content, CF)       │
│ - GBDT / lightweight ranker for final re-ordering      │
└────────────────────────────────────────────────────────┘
```

## 2. Telemetry Signal Weighting

Interactions are collected with pseudonymous identifiers (`userId`) and weighted:
- `complete` (listened >80%): Weight `+1.0`
- `listen_30s`: Weight `+0.4`
- `like`: Weight `+2.0`
- `add_to_playlist`: Weight `+1.5`
- `skip_quick` (<15s): Weight `-1.0`

## 3. Privacy Preservation in ML
- Models are trained strictly on pseudonymous user vectors (`userId` hashes).
- No demographics, device telemetry, or external identities enter training data.
- When a user deletes their account (`DELETE /v1/me`), their interaction rows are purged from training partitions.
