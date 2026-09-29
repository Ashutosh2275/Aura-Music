import json
import logging
import time
from typing import Any, Optional
import redis.asyncio as redis
from backend.app.core.config import settings

logger = logging.getLogger(__name__)


class CacheManager:
    """
    Redis cache layer for trending, recommendations, and search caching.
    Includes in-memory fallback when Redis is unreachable.
    Never used as primary persistence.
    """

    def __init__(self):
        self._redis_client: Optional[redis.Redis] = None
        self._memory_cache: dict = {}
        self._rate_limits: dict = {}

    async def get_client(self) -> Optional[redis.Redis]:
        if self._redis_client is None:
            try:
                client = redis.from_url(settings.REDIS_URL, decode_responses=True)
                await client.ping()
                self._redis_client = client
                logger.info("[Cache] Connected to Redis successfully.")
            except Exception as e:
                logger.warning(f"[Cache] Redis unavailable ({e}). Using in-memory cache fallback.")
                self._redis_client = None
        return self._redis_client

    async def get(self, key: str) -> Optional[Any]:
        client = await self.get_client()
        if client:
            try:
                data = await client.get(key)
                return json.loads(data) if data else None
            except Exception:
                pass

        # In-memory fallback with TTL check
        entry = self._memory_cache.get(key)
        if entry:
            val, expiry = entry
            if expiry is None or time.time() < expiry:
                return val
            del self._memory_cache[key]
        return None

    async def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None:
        client = await self.get_client()
        if client:
            try:
                await client.set(key, json.dumps(value), ex=ttl_seconds)
                return
            except Exception:
                pass

        # In-memory fallback
        expiry = time.time() + ttl_seconds if ttl_seconds else None
        self._memory_cache[key] = (value, expiry)

    async def check_rate_limit(self, client_ip: str, limit: int = 60, window_seconds: int = 60) -> bool:
        """
        Token bucket / sliding window rate limiter.
        Returns True if allowed, False if exceeded.
        """
        now = time.time()
        client = await self.get_client()
        key = f"rate_limit:{client_ip}"

        if client:
            try:
                current = await client.incr(key)
                if current == 1:
                    await client.expire(key, window_seconds)
                return current <= limit
            except Exception:
                pass

        # Memory rate limit
        requests = self._rate_limits.setdefault(client_ip, [])
        # Evict old requests
        valid_requests = [t for t in requests if now - t < window_seconds]
        if len(valid_requests) >= limit:
            self._rate_limits[client_ip] = valid_requests
            return False

        valid_requests.append(now)
        self._rate_limits[client_ip] = valid_requests
        return True


cache = CacheManager()
