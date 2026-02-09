# Green Recycle Backend

Backend support for Green Recycle project using FastAPI and FastAPI-Admin.

## Requirements

- Python 3.8+
- Redis (required for FastAPI-Admin)

## Installation

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configure environment:
   Check `.env` file for configuration.
   Ensure Redis is running.

3. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

## Admin Panel

Access the admin panel at `http://localhost:8000/admin`.
Default credentials: `admin` / `admin`.

## API

API documentation available at `http://localhost:8000/docs`.
