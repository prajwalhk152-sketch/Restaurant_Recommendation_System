import { useEffect, useState } from "react";

import {
  MapPin,
  Search,
  Star,
  Utensils,
  Sparkles,
  Users,
  Award,
  ChevronDown,
} from "lucide-react";

import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
  // ============================================================
  // STATE
  // ============================================================

  const [cuisines, setCuisines] = useState([]);
  const [cities, setCities] = useState([]);

  const [cuisine, setCuisine] = useState("");
  const [city, setCity] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [rating, setRating] = useState(0);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD CUISINES AND CITIES
  // ============================================================

  useEffect(() => {
    fetch(`${API}/options`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load options");
        }

        return response.json();
      })
      .then((data) => {
        setCuisines(data.cuisines || []);
        setCities(data.cities || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load restaurant options.");
      });
  }, []);

  // ============================================================
  // FIND RESTAURANTS
  // ============================================================

  const findRestaurants = async () => {
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch(`${API}/recommend`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          cuisine: cuisine || null,
          city: city || null,
          price_range: priceRange
            ? Number(priceRange)
            : null,
          min_rating: Number(rating),
          top_n: 10,
        }),
      });

      if (!response.ok) {
        throw new Error("Recommendation request failed");
      }

      const data = await response.json();

      setResults(data.recommendations || []);
    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to the recommendation server. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORMAT NAME
  // ============================================================

  const formatName = (value) => {
    if (!value) return "";

    return String(value)
      .split(" ")
      .map((word) =>
        word.length > 0
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : word
      )
      .join(" ");
  };

  // ============================================================
  // FORMAT CUISINE
  // ============================================================

  const formatCuisine = (value) => {
    if (!value) return "Restaurant";

    return String(value)
      .split(",")
      .map((item) => item.trim())
      .map((item) =>
        item
          .split(" ")
          .map((word) =>
            word.length > 0
              ? word.charAt(0).toUpperCase() + word.slice(1)
              : word
          )
          .join(" ")
      )
      .join(" • ");
  };

  // ============================================================
  // PRICE SYMBOL
  // ============================================================

  const getPriceSymbol = (value) => {
    const count = Number(value) || 1;

    return "₹".repeat(count);
  };

  // ============================================================
  // AI MATCH SCORE
  // ============================================================

  const getMatchScore = (restaurant) => {
    const score = Number(restaurant["final_score"]);

    if (Number.isNaN(score)) {
      return 0;
    }

    return Math.min(Math.max(score * 100, 0), 100);
  };

  // ============================================================
  // VISUAL CARD STYLE
  // ============================================================

  const getVisualClass = (index) => {
    const styles = [
      "visual-one",
      "visual-two",
      "visual-three",
      "visual-four",
      "visual-five",
      "visual-six",
    ];

    return styles[index % styles.length];
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="app">

      {/* ========================================================
          NAVBAR
      ======================================================== */}

      <nav className="navbar">

        <div className="brand">

          <div className="brand-icon">
            <Utensils size={21} />
          </div>

          <div className="brand-copy">
            <strong>TasteMatch</strong>
            <span>Restaurant Recommendations</span>
          </div>

        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#recommend">Recommendations</a>
          <a href="#about">About</a>
        </div>

      </nav>

      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="hero" id="home">

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <div className="hero-badge">
            <Sparkles size={15} />
            AI-POWERED RESTAURANT DISCOVERY
          </div>

          <h1>
            Find Your
            <span>Perfect Restaurant</span>
          </h1>

          <p>
            Discover restaurants tailored to your cuisine,
            location, budget and rating preferences.
          </p>

          <a href="#recommend" className="hero-button">
            <Search size={17} />
            Explore Restaurants
          </a>

        </div>

      </section>

      {/* ========================================================
          PREFERENCES
      ======================================================== */}

      <section
        className="preferences-section"
        id="recommend"
      >

        <div className="section-heading">

          <div>

            <div className="section-label">
              PERSONALIZE YOUR SEARCH
            </div>

            <h2>Your Preferences</h2>

            <p>
              Tell us what you're looking for and our
              recommendation engine will find the best matches.
            </p>

          </div>

          <div className="heading-icon">
            <Sparkles size={24} />
          </div>

        </div>

        <div className="preferences-card">

          {/* CUISINE */}

          <div className="field-group">

            <label>
              <Utensils size={16} />
              Cuisine
            </label>

            <div className="select-wrapper">

              <select
                value={cuisine}
                onChange={(e) =>
                  setCuisine(e.target.value)
                }
              >

                <option value="">
                  Select cuisine
                </option>

                {cuisines.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {formatName(item)}
                  </option>
                ))}

              </select>

              <ChevronDown size={17} />

            </div>

          </div>

          {/* CITY */}

          <div className="field-group">

            <label>
              <MapPin size={16} />
              City
            </label>

            <div className="select-wrapper">

              <select
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
              >

                <option value="">
                  Select city
                </option>

                {cities.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {formatName(item)}
                  </option>
                ))}

              </select>

              <ChevronDown size={17} />

            </div>

          </div>

          {/* PRICE */}

          <div className="field-group">

            <label>
              <span className="price-icon">
                ₹
              </span>

              Price Range
            </label>

            <div className="select-wrapper">

              <select
                value={priceRange}
                onChange={(e) =>
                  setPriceRange(e.target.value)
                }
              >

                <option value="">
                  Any price
                </option>

                <option value="1">
                  ₹
                </option>

                <option value="2">
                  ₹₹
                </option>

                <option value="3">
                  ₹₹₹
                </option>

                <option value="4">
                  ₹₹₹₹
                </option>

              </select>

              <ChevronDown size={17} />

            </div>

          </div>

          {/* RATING */}

          <div className="field-group rating-group">

            <div className="rating-title">

              <label>
                <Star size={16} />
                Minimum Rating
              </label>

              <strong>
                {rating === 0
                  ? "Any"
                  : `${rating.toFixed(1)}+`}
              </strong>

            </div>

            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={rating}
              onChange={(e) =>
                setRating(Number(e.target.value))
              }
            />

            <div className="range-labels">
              <span>Any</span>
              <span>5.0</span>
            </div>

          </div>

          {/* FIND BUTTON */}

          <button
            className="find-button"
            onClick={findRestaurants}
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="spinner"></span>
                Finding...
              </>
            ) : (
              <>
                <Search size={18} />
                Find My Restaurants
              </>
            )}

          </button>

        </div>

      </section>

      {/* ========================================================
          ERROR
      ======================================================== */}

      {error && (

        <div className="error-box">

          <strong>
            Something went wrong
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}

      {/* ========================================================
          RESULTS
      ======================================================== */}

      {results.length > 0 && (

        <section className="results-section">

          <div className="results-header">

            <div>

              <div className="section-label">
                CURATED FOR YOU
              </div>

              <h2>
                Top Recommendations
              </h2>

              <p>
                Selected using cuisine, location, price,
                rating and recommendation similarity.
              </p>

            </div>

            <div className="result-pill">
              {results.length} restaurants
            </div>

          </div>

          <div className="restaurant-grid">

            {results.map((restaurant, index) => {

              const matchScore =
                getMatchScore(restaurant);

              return (

                <article
                  className={`restaurant-card ${
                    index === 0 ? "top-card" : ""
                  }`}
                  key={
                    restaurant["Restaurant ID"] ||
                    index
                  }
                >

                  {/* =================================================
                      VISUAL AREA
                  ================================================= */}

                  <div
                    className={`restaurant-visual ${getVisualClass(
                      index
                    )}`}
                  >

                    <div className="visual-pattern">

                      <Utensils size={48} />

                      <span>
                        {
                          formatCuisine(
                            restaurant["Cuisines"]
                          ).split(" • ")[0]
                        }
                      </span>

                    </div>

                    <div className="visual-decoration">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>

                    <div className="rank-badge">
                      #{index + 1}
                    </div>

                    <div className="rating-badge">

                      <Star
                        size={14}
                        fill="currentColor"
                      />

                      {restaurant["Aggregate rating"]}

                    </div>

                  </div>

                  {/* =================================================
                      CARD CONTENT
                  ================================================= */}

                  <div className="restaurant-content">

                    <div className="restaurant-title-row">

                      <h3>
                        {formatName(
                          restaurant["Restaurant Name"]
                        )}
                      </h3>

                      {index === 0 && (

                        <span className="best-match">
                          BEST MATCH
                        </span>

                      )}

                    </div>

                    <p className="restaurant-cuisine">
                      {formatCuisine(
                        restaurant["Cuisines"]
                      )}
                    </p>

                    <p className="restaurant-location">

                      <MapPin size={14} />

                      {formatName(
                        restaurant["City"]
                      )}

                    </p>

                    <div className="card-divider"></div>

                    {/* DETAILS */}

                    <div className="restaurant-meta">

                      <span className="price-value">
                        {getPriceSymbol(
                          restaurant["Price range"]
                        )}
                      </span>

                      <span>
                        <Users size={14} />

                        {restaurant["Votes"] || 0}
                        {" "}votes
                      </span>

                      <span>
                        <Award size={14} />

                        {matchScore.toFixed(1)}%
                      </span>

                    </div>

                    {/* AI MATCH */}

                    <div className="match-bar">

                      <div className="match-bar-header">

                        <span>
                          AI Match
                        </span>

                        <strong>
                          {matchScore.toFixed(1)}%
                        </strong>

                      </div>

                      <div className="match-track">

                        <div
                          className="match-fill"
                          style={{
                            width: `${matchScore}%`,
                          }}
                        ></div>

                      </div>

                    </div>

                  </div>

                </article>

              );

            })}

          </div>

        </section>

      )}

      {/* ========================================================
          EMPTY STATE
      ======================================================== */}

      {!loading &&
        results.length === 0 &&
        !error && (

          <section className="empty-state">

            <div className="empty-icon">
              <Utensils size={27} />
            </div>

            <h2>
              Your recommendations will appear here
            </h2>

            <p>
              Choose your preferences above and
              discover restaurants matched to your taste.
            </p>

          </section>

        )}

      {/* ========================================================
          FEATURES
      ======================================================== */}

      <section
        className="feature-strip"
        id="about"
      >

        <div className="feature-item">

          <Sparkles size={20} />

          <div>
            <strong>
              Personalized
            </strong>

            <span>
              Built around your preferences
            </span>
          </div>

        </div>

        <div className="feature-item">

          <MapPin size={20} />

          <div>
            <strong>
              Location Based
            </strong>

            <span>
              Discover restaurants near you
            </span>
          </div>

        </div>

        <div className="feature-item">

          <Award size={20} />

          <div>
            <strong>
              Top Rated
            </strong>

            <span>
              Quality reflected in the ranking
            </span>
          </div>

        </div>

        <div className="feature-item">

          <Users size={20} />

          <div>
            <strong>
              Data Driven
            </strong>

            <span>
              Powered by your ML model
            </span>
          </div>

        </div>

      </section>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <footer className="footer">

        <div className="footer-brand">

          <div className="brand-icon">
            <Utensils size={18} />
          </div>

          <strong>
            TasteMatch
          </strong>

        </div>

        <p>
          AI-powered restaurant recommendation
          system built with Python, Machine
          Learning, FastAPI and React.
        </p>

        <span>
          © 2026 TasteMatch
        </span>

      </footer>

    </div>
  );
}

export default App;