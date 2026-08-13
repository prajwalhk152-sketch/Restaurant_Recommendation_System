import { useEffect, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
  const [cuisines, setCuisines] = useState([]);
  const [cities, setCities] = useState([]);
  const [priceRange, setPriceRange] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [city, setCity] = useState("");
  const [rating, setRating] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load dropdown data
  useEffect(() => {
    fetch(`${API}/options`)
      .then((response) => response.json())
      .then((data) => {
        setCuisines(data.cuisines || []);
        setCities(data.cities || []);
      })
      .catch((error) => {
        console.error("Error loading options:", error);
      });
  }, []);

  const findRestaurants = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cuisine: cuisine || null,
          city: city || null,
          price_range: priceRange ? Number(priceRange) : null,
          min_rating: Number(rating),
          top_n: 10,
        }),
      });

      const data = await response.json();

      if (data.recommendations) {
        setResults(data.recommendations);
      }
    } catch (error) {
      console.error("Recommendation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          <span>🍴</span> FoodFinder
        </div>

        <div className="nav-links">
          <span>Home</span>
          <span>Discover</span>
          <span>About</span>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">AI-POWERED RESTAURANT DISCOVERY</p>

            <h1>
              Find your next
              <br />
              <span>perfect meal.</span>
            </h1>

            <p className="subtitle">
              Tell us what you're craving and we'll find restaurants
              you'll love.
            </p>

            <div className="search-card">
              <div className="field">
                <label>Cuisine</label>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                >
                  <option value="">Select cuisine</option>

                  {cuisines.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">Select city</option>

                  {cities.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="">Any price</option>
                  <option value="1">₹</option>
                  <option value="2">₹₹</option>
                  <option value="3">₹₹₹</option>
                  <option value="4">₹₹₹₹</option>
                </select>
              </div>

              <div className="rating-field">
                <div className="rating-header">
                  <label>Minimum Rating</label>
                  <span>{rating === 0 ? "Any" : rating.toFixed(1)}</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </div>

              <button onClick={findRestaurants}>
                {loading ? "Finding..." : "Find My Restaurants →"}
              </button>
            </div>
          </div>
        </section>

        {results.length > 0 && (
          <section className="results">
            <div className="results-heading">
              <p className="eyebrow">RECOMMENDED FOR YOU</p>
              <h2>Restaurants you'll love</h2>
            </div>

            <div className="restaurant-grid">
              {results.map((restaurant, index) => (
                <div className="restaurant-card" key={index}>
                  <div className="restaurant-image">
                    🍽️
                  </div>

                  <div className="restaurant-info">
                    <div className="restaurant-top">
                      <h3>{restaurant["Restaurant Name"]}</h3>

                      <span className="rating">
                        ★ {restaurant["Aggregate rating"]}
                      </span>
                    </div>

                    <p className="cuisine">
                      {restaurant["Cuisines"]}
                    </p>

                    <p className="location">
                      📍 {restaurant["City"]}
                    </p>

                    <div className="restaurant-footer">
                      <span>
                        {"₹".repeat(restaurant["Price range"])}
                      </span>

                      <span>
                        {restaurant["Votes"]} votes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;