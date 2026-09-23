"""Test fixtures for Brelock Holmes backend."""

import pytest
import pytest_asyncio
from app.db.base import Base
from app.db.session import engine
from app.security.validators import clear_registry


@pytest_asyncio.fixture(autouse=True, scope="function")
async def prepare_database():
    """Create all tables before each test and drop them after, plus clear session registry."""
    clear_registry()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    clear_registry()
