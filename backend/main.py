from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import sys
from pathlib import Path


# ============================================================
# PROJECT PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))


# ============================================================
# IMPORT RECOMMENDER
# ============================================================

from restaurant_recommender import (
    recommend_restaurants,
    data
)


# ============================================================
# CREATE FASTAPI APP
# ============================================================

app = FastAPI(
    title="TasteMatch Restaurant Recommendation API",
    description="AI-powered restaurant recommendation system",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class RecommendationRequest(BaseModel):

    cuisine: str | None = None

    city: str | None = None

    price_range: int | None = None

    min_rating: float = 0.0

    top_n: int = 10


# ============================================================
# HOME ENDPOINT
# ============================================================

@app.get("/")
def home():

    return {
        "message": "Restaurant Recommendation API is running",
        "status": "success"
    }


# ============================================================
# OPTIONS ENDPOINT
# Used by React frontend to load dropdowns
# ============================================================

@app.get("/options")
def get_options():

    # --------------------------------------------------------
    # CUISINES
    # --------------------------------------------------------

    cuisines = sorted(
        data["Cuisines"]
        .dropna()
        .astype(str)
        .str.split(", ")
        .explode()
        .str.strip()
        .str.lower()
        .unique()
        .tolist()
    )


    # --------------------------------------------------------
    # CITIES
    # --------------------------------------------------------

    cities = sorted(
        data["City"]
        .dropna()
        .astype(str)
        .str.strip()
        .str.lower()
        .unique()
        .tolist()
    )


    return {
        "status": "success",
        "cuisines": cuisines,
        "cities": cities
    }


# ============================================================
# RECOMMENDATION ENDPOINT
# ============================================================

@app.post("/recommend")
def recommend(request: RecommendationRequest):

    results = recommend_restaurants(
        cuisine=request.cuisine,
        price_range=request.price_range,
        city=request.city,
        min_rating=request.min_rating,
        top_n=request.top_n
    )


    # --------------------------------------------------------
    # SELECT COLUMNS
    # --------------------------------------------------------

    columns = [
        "Restaurant ID",
        "Restaurant Name",
        "City",
        "Locality",
        "Cuisines",
        "Price range",
        "Aggregate rating",
        "Votes",
        "Has Online delivery",
        "Has Table booking",
        "similarity_score",
        "final_score"
    ]


    # Keep only columns that actually exist
    available_columns = [
        column
        for column in columns
        if column in results.columns
    ]

    results = results[available_columns]


    # --------------------------------------------------------
    # HANDLE MISSING VALUES
    # --------------------------------------------------------

    results = results.fillna("")


    # --------------------------------------------------------
    # CONVERT TO JSON
    # --------------------------------------------------------

    recommendations = results.to_dict(
        orient="records"
    )


    return {
        "status": "success",
        "count": len(recommendations),
        "recommendations": recommendations
    }