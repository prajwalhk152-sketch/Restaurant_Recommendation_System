import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ============================================================
# 1. LOAD DATASET
# ============================================================

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
df = pd.read_csv(BASE_DIR / "Dataset.csv")

print("=" * 60)
print("RESTAURANT RECOMMENDATION SYSTEM")
print("=" * 60)

print("\nOriginal Dataset Shape:", df.shape)


# ============================================================
# 2. SELECT RELEVANT FEATURES
# ============================================================

data = df[
    [
        "Restaurant ID",
        "Restaurant Name",
        "City",
        "Locality",
        "Cuisines",
        "Price range",
        "Aggregate rating",
        "Votes",
        "Has Online delivery",
        "Has Table booking"
    ]
].copy()


# ============================================================
# 3. HANDLE MISSING VALUES
# ============================================================

data["Cuisines"] = data["Cuisines"].fillna("Unknown")


# ============================================================
# 4. STANDARDIZE TEXT
# ============================================================

data["Cuisines"] = data["Cuisines"].str.lower().str.strip()
data["City"] = data["City"].str.lower().str.strip()
data["Locality"] = data["Locality"].str.lower().str.strip()


# ============================================================
# 5. CREATE CONTENT FEATURES
# ============================================================

data["content"] = (
    data["Cuisines"] + " " +
    data["City"] + " " +
    data["Locality"]
)


# ============================================================
# 6. TF-IDF VECTORIZATION
# ============================================================

tfidf = TfidfVectorizer(
    stop_words="english"
)

tfidf_matrix = tfidf.fit_transform(
    data["content"]
)

print("\nTF-IDF Matrix Shape:", tfidf_matrix.shape)


# ============================================================
# 7. RECOMMENDATION FUNCTION
# ============================================================

def recommend_restaurants(
    cuisine=None,
    price_range=None,
    city=None,
    min_rating=0.0,
    top_n=10
):
    """
    Recommend restaurants using content-based filtering.

    Parameters:
        cuisine: Preferred cuisine
        price_range: Preferred price range (1-4)
        city: Preferred city
        min_rating: Minimum acceptable rating
        top_n: Number of recommendations
    """

    # --------------------------------------------------------
    # Create user preference text
    # --------------------------------------------------------

    preference_parts = []

    if cuisine:
        preference_parts.append(cuisine.lower())

    if city:
        preference_parts.append(city.lower())

    user_profile = " ".join(preference_parts)

    # --------------------------------------------------------
    # Calculate content similarity
    # --------------------------------------------------------

    if user_profile:
        user_vector = tfidf.transform([user_profile])

        similarity_scores = cosine_similarity(
            user_vector,
            tfidf_matrix
        ).flatten()

    else:
        similarity_scores = [0] * len(data)

    # --------------------------------------------------------
    # Create recommendation dataframe
    # --------------------------------------------------------

    recommendations = data.copy()

    recommendations["similarity_score"] = similarity_scores
# --------------------------------------------------------
# City preference
# --------------------------------------------------------

    if city:
        recommendations = recommendations[
            recommendations["City"].str.contains(
               city.lower(),
               na=False
            )
        ].copy()

# --------------------------------------------------------
# Price compatibility
# --------------------------------------------------------

    if price_range:
        recommendations["price_score"] = (
            1 - (
                abs(
                recommendations["Price range"] - price_range
                ) / 3
            )
        )
    else:
        recommendations["price_score"] = 0.5

    # --------------------------------------------------------
    # Rating score
    # --------------------------------------------------------

    recommendations["rating_score"] = (
        recommendations["Aggregate rating"] / 5
    )

    # --------------------------------------------------------
    # Popularity score
    # --------------------------------------------------------

    max_votes = recommendations["Votes"].max()

    if max_votes > 0:
        recommendations["popularity_score"] = (
            recommendations["Votes"] / max_votes
        )
    else:
        recommendations["popularity_score"] = 0

    # --------------------------------------------------------
    # Minimum rating
    # --------------------------------------------------------

    recommendations = recommendations[
        recommendations["Aggregate rating"] >= min_rating
    ].copy()

    # --------------------------------------------------------
    # Final recommendation score
    # --------------------------------------------------------

    recommendations["final_score"] = (
        recommendations["similarity_score"] * 0.50
        + recommendations["price_score"] * 0.20
        + recommendations["rating_score"] * 0.20
        + recommendations["popularity_score"] * 0.10
    )

    # --------------------------------------------------------
    # Sort recommendations
    # --------------------------------------------------------

    recommendations = recommendations.sort_values(
        by="final_score",
        ascending=False
    )

    return recommendations.head(top_n)


# ============================================================
# 8. TEST THE RECOMMENDER
# ============================================================



# ============================================================
# 9. DISPLAY RESULTS
# ============================================================

