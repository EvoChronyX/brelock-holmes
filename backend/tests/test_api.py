"""API integration tests using httpx and FastAPI test client."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["service"] == "brelock-holmes"


@pytest.mark.asyncio
async def test_protocols_list():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/protocols")
        assert res.status_code == 200
        data = res.json()
        assert len(data) >= 1
        assert data[0]["id"] == "teleportation_qds"


@pytest.mark.asyncio
async def test_create_and_get_experiment():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create normal experiment
        create_res = await client.post(
            "/api/experiments",
            json={
                "name": "Integration Test Normal",
                "shots": 1024,
                "attack_type": "normal",
            },
        )
        assert create_res.status_code == 200
        exp = create_res.json()
        assert exp["status"] == "completed"
        assert exp["detection_status"] == "NORMAL"
        assert exp["fidelity"] is not None
        assert exp["fidelity"] > 0.95

        # Get experiment by ID
        get_res = await client.get(f"/api/experiments/{exp['id']}")
        assert get_res.status_code == 200
        assert get_res.json()["id"] == exp["id"]


@pytest.mark.asyncio
async def test_simulate_forgery_attack():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/attacks/simulate",
            json={"attack_type": "forgery", "shots": 1024},
        )
        assert res.status_code == 200
        exp = res.json()
        assert exp["detection_status"] == "THREAT_DETECTED"
        assert exp["detected_attack_type"] == "forgery"
        assert exp["severity"] == "CRITICAL"


@pytest.mark.asyncio
async def test_simulate_replay_attack():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/attacks/simulate",
            json={"attack_type": "replay", "shots": 1024},
        )
        assert res.status_code == 200
        exp = res.json()
        assert exp["detection_status"] == "THREAT_DETECTED"
        assert exp["detected_attack_type"] == "replay"


@pytest.mark.asyncio
async def test_analytics_summary():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/analytics/summary")
        assert res.status_code == 200
        data = res.json()
        assert "total_experiments" in data
        assert "threats_detected" in data
        assert "normal_sessions" in data


@pytest.mark.asyncio
async def test_baseline_calibration():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/baseline/calibrate",
            json={
                "shots": 256,
                "noise_levels": [0.0, 0.05],
                "num_runs": 2,
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["calibrated"] is True
        assert "0.0" in data["fidelity_mean"]
