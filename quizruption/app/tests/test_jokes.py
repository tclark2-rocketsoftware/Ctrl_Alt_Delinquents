import os
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models

client = TestClient(app)


def test_daily_joke_structure_and_caching():
    # First call - should create today's joke
    r1 = client.get('/api/jokes/daily')
    assert r1.status_code == 200
    data1 = r1.json()
    for key in ['date', 'joke', 'source', 'cached']:
        assert key in data1
    assert isinstance(data1['joke'], str) and len(data1['joke']) > 10
    assert data1['cached'] is False

    # Second call - should return cached
    r2 = client.get('/api/jokes/daily')
    assert r2.status_code == 200
    data2 = r2.json()
    assert data2['date'] == data1['date']
    assert data2['joke'] == data1['joke']
    assert data2['cached'] is True


def test_daily_joke_persistence_in_db():
    # Ensure record exists in DB after call
    client.get('/api/jokes/daily')
    db = SessionLocal()
    try:
        count = db.query(models.DailyJoke).count()
        assert count >= 1
    finally:
        db.close()