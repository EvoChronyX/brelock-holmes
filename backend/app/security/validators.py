"""Session registry for replay detection."""

from datetime import datetime, timezone

# In-memory registry — sufficient for prototype; swap for DB in production
_session_registry: dict[str, dict] = {}


def register_session(session_id: str, nonce: str, timestamp: datetime | None = None) -> None:
    """Record a new session."""
    _session_registry[session_id] = {
        "nonce": nonce,
        "timestamp": timestamp or datetime.now(timezone.utc),
    }


def is_replay(session_id: str, nonce: str) -> bool:
    """Check if this session_id+nonce has been seen before."""
    if session_id in _session_registry:
        return _session_registry[session_id]["nonce"] == nonce
    return False


def clear_registry() -> None:
    _session_registry.clear()
