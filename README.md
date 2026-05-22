# 🍽️ Catering Grocery Planner

A full-stack web application for catering businesses to manage dishes, ingredients, events, and auto-generate grocery lists.

## Tech Stack

- **Backend**: Python FastAPI (async) + PostgreSQL + SQLAlchemy (Async) + Alembic
- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Architecture**: Clean (Router → Controller → Service → Repository)

## Project Structure

```
catering-app/
├── backend/
│   ├── app/
│   │   ├── core/          # Config, DB session
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic v2 schemas
│   │   ├── repositories/  # DB access layer
│   │   ├── services/      # Business logic
│   │   ├── controllers/   # Request/response handlers
│   │   ├── routers/       # FastAPI route definitions
│   │   └── main.py
│   ├── alembic/           # DB migrations
│   ├── seed.py            # Sample data
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/         # DishesPage, IngredientsPage, EventsPage, GroceryPage
        ├── api/           # Axios API client
        └── types/         # TypeScript interfaces
```

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup

```bash
psql -U postgres
CREATE DATABASE catering_db;
\q
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run migrations
alembic revision --autogenerate -m "initial"
alembic upgrade head

# Seed sample data
python seed.py

# Start server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies /api to backend)
npm run dev
```

Open: http://localhost:3000

## Deployment (Free Managed Hosting)

See `DEPLOY_MANAGED_FREE.md` for deploying without Docker using:

- Frontend: Vercel
- Backend: Render
- Database: Supabase PostgreSQL

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/v1/dishes` | List / Create dishes |
| GET/PUT/DELETE | `/api/v1/dishes/{id}` | Dish CRUD |
| GET | `/api/v1/dishes/{id}/recipes` | Get dish recipes |
| GET/POST | `/api/v1/ingredients` | List / Create ingredients |
| GET/PUT/DELETE | `/api/v1/ingredients/{id}` | Ingredient CRUD |
| POST | `/api/v1/recipes` | Add recipe mapping |
| PUT/DELETE | `/api/v1/recipes/{id}` | Update/Delete recipe |
| GET/POST | `/api/v1/events` | List / Create events |
| GET/PUT/DELETE | `/api/v1/events/{id}` | Event CRUD |
| **POST** | **`/api/v1/events/{id}/generate-grocery-list`** | **Generate grocery list** |

### Grocery List Request

```json
POST /api/v1/events/1/generate-grocery-list
{ "buffer_percentage": 10 }
```

### Grocery List Response

```json
{
  "success": true,
  "data": {
    "event_id": 1,
    "event_name": "Wedding Reception",
    "people_count": 100,
    "buffer_percentage": 10,
    "ingredients": [
      { "name": "Tomato", "quantity": 66.0, "unit": "kg", "category": "Vegetables", "total_price": 2640.0 }
    ],
    "total_cost": 12500.00
  }
}
```

## Calculation Formula

```
Required Quantity = (Requested People / Base Serving) × Base Quantity × (1 + Buffer% / 100)
```

Example: Tomato Fry (base 10 people), Tomato = 6kg  
For 100 people with 10% buffer: `(100/10) × 6 × 1.1 = 66kg`

## Features

- ✅ Dish management with categories (Breakfast/Lunch/Dinner/Snacks)
- ✅ Ingredient management with pricing
- ✅ Recipe mapping (dish → ingredients + quantities)
- ✅ Event creation with multi-dish selection
- ✅ Automatic grocery calculation with scaling
- ✅ Buffer percentage support
- ✅ Ingredient aggregation across dishes
- ✅ Editable grocery list output
- ✅ Cost estimation
- ✅ Print/PDF export
- ✅ Responsive UI
