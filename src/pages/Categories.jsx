import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchProducts, fetchBrands } from "../services/productService";
import { fetchCategories } from "../services/categoryService";
import { 
  Search, 
  SlidersHorizontal, 
  AlertCircle, 
  ShoppingBag, 
  Star,
  CheckCircle,
  X,
  Compass
} from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import OrderPagination from "../components/orders/OrderPagination";
import "./Categories.css";

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const catQuery = searchParams.get("cat"); // matches category slug from homepage links (e.g. luggage, bags)

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");
  const [minPrice, setMinPrice] = useState(() => searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("max_price") || "");

  // Derived state from URL search parameters
  const selectedBrand = searchParams.get("brand") || "";
  const isFeaturedOnly = searchParams.get("featured") === "true";
  const sortBy = searchParams.get("sort") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Sync text inputs with URL params (e.g. for back/forward navigation)
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams.get("search")]);

  useEffect(() => {
    setMinPrice(searchParams.get("min_price") || "");
  }, [searchParams.get("min_price")]);

  useEffect(() => {
    setMaxPrice(searchParams.get("max_price") || "");
  }, [searchParams.get("max_price")]);

  // Debounce sync searchQuery back to URL
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      if (searchQuery !== currentSearch) {
        const newParams = new URLSearchParams(searchParams);
        if (searchQuery) {
          newParams.set("search", searchQuery);
        } else {
          newParams.delete("search");
        }
        newParams.set("page", "1");
        setSearchParams(newParams, { replace: true });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchParams, setSearchParams]);

  // Debounce sync minPrice and maxPrice back to URL
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let updated = false;
      const newParams = new URLSearchParams(searchParams);

      const currentMin = newParams.get("min_price") || "";
      if (minPrice !== currentMin) {
        if (minPrice) {
          newParams.set("min_price", minPrice);
        } else {
          newParams.delete("min_price");
        }
        updated = true;
      }

      const currentMax = newParams.get("max_price") || "";
      if (maxPrice !== currentMax) {
        if (maxPrice) {
          newParams.set("max_price", maxPrice);
        } else {
          newParams.delete("max_price");
        }
        updated = true;
      }

      if (updated) {
        newParams.set("page", "1");
        setSearchParams(newParams, { replace: true });
      }
    }, 700);

    return () => clearTimeout(delayDebounceFn);
  }, [minPrice, maxPrice, searchParams, setSearchParams]);
  const [totalPages, setTotalPages] = useState(1);
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch Categories on mount (only once)
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await fetchCategories({ page_size: 100 });
        setCategories(res.data.results || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Sync selectedCategory with catQuery URL param on navigation
  useEffect(() => {
    if (categories.length > 0) {
      if (catQuery) {
        const matched = categories.find(
          (c) => c.slug.toLowerCase() === catQuery.toLowerCase()
        );
        setSelectedCategory(matched || null);
      } else {
        setSelectedCategory(null);
      }
    } else if (!categoriesLoading) {
      setSelectedCategory(null);
    }
  }, [catQuery, categories, categoriesLoading]);

  // Fetch Brands on mount
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const res = await fetchBrands();
        setBrands(res.data || []);
      } catch (err) {
        console.error("Error fetching brands:", err);
      }
    };
    loadBrands();
  }, []);

  const setPage = (pageNum) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", pageNum.toString());
    setSearchParams(newParams);
  };

  // Fetch products when selectedCategory, categoriesLoading, or searchParams change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          search: searchParams.get("search") || undefined,
          category: selectedCategory?.id || undefined,
          brand: selectedBrand || undefined,
          is_featured: isFeaturedOnly ? "true" : undefined,
          ordering: sortBy || undefined,
          min_price: searchParams.get("min_price") || undefined,
          max_price: searchParams.get("max_price") || undefined,
        };
        const res = await fetchProducts(params);
        setProducts(res.data.results || []);
        setProductsCount(res.data.count || 0);
        setTotalPages(Math.ceil((res.data.count || 0) / 9)); // Product view has 9 per page
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    if (!categoriesLoading) {
      loadProducts();
    }
  }, [selectedCategory, categoriesLoading, searchParams]);

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set("cat", category.slug);
    } else {
      newParams.delete("cat");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setSearchParams({});
  };

  return (
    <div className="categories-page-wrapper">
      <Navbar />

      {/* Banner / Header */}
      <header className="categories-header-hero">
        <div className="hero-overlay-content">
          <span className="hero-pre-tag">TravelKart Gear Catalogue</span>
          <h1 className="hero-title-main font-plus-jakarta">
            {selectedCategory ? selectedCategory.name : "All Categories"}
          </h1>
          <p className="hero-subtitle">
            {selectedCategory?.description 
              ? selectedCategory.description 
              : "Discover elite, high-performance travel architecture designed for global exploration, business travels, and local adventures."}
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="categories-container font-inter">
        
        {/* Categories Sidebar */}
        <aside className="categories-sidebar">
          
          {/* Category List Filters */}
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Categories</h3>
            {categoriesLoading ? (
              <div className="sidebar-skeleton-stack">
                {[1, 2, 3, 4].map(n => <div key={n} className="skeleton-pill" />)}
              </div>
            ) : (
              <ul className="category-filter-list">
                <li>
                  <button 
                    className={`category-filter-btn ${!selectedCategory ? "active" : ""}`}
                    onClick={() => handleCategorySelect(null)}
                  >
                    <Compass size={16} />
                    <span>All Categories</span>
                  </button>
                </li>
                {categories.filter(c => !c.parent).map((parentCat) => {
                  const subcats = categories.filter(c => c.parent === parentCat.id);
                  const isExpanded = selectedCategory && (selectedCategory.id === parentCat.id || selectedCategory.parent === parentCat.id);
                  
                  return (
                    <li key={parentCat.id} className="category-list-item-group">
                      <button 
                        className={`category-filter-btn ${selectedCategory?.id === parentCat.id ? "active" : ""}`}
                        onClick={() => handleCategorySelect(parentCat)}
                      >
                        <span>{parentCat.name}</span>
                      </button>
                      
                      {isExpanded && subcats.length > 0 && (
                        <ul className="subcategory-filter-list">
                          {subcats.map((subcat) => (
                            <li key={subcat.id}>
                              <button
                                className={`subcategory-filter-btn ${selectedCategory?.id === subcat.id ? "active" : ""}`}
                                onClick={() => handleCategorySelect(subcat)}
                              >
                                <span>{subcat.name}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Search Box Filter */}
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Search Merchandise</h3>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={16} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
 
          {/* Brand Selection Filters */}
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Brands</h3>
            <select 
              value={selectedBrand} 
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) {
                  newParams.set("brand", e.target.value);
                } else {
                  newParams.delete("brand");
                }
                newParams.set("page", "1");
                setSearchParams(newParams);
              }}
              className="brand-select-dropdown"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
 
          {/* Price Range Filters */}
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Price Range</h3>
            <div className="price-range-inputs">
              <input 
                type="number" 
                placeholder="Min Price" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="price-range-field"
              />
              <span className="price-range-divider">to</span>
              <input 
                type="number" 
                placeholder="Max Price" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="price-range-field"
              />
            </div>
          </div>
 
          {/* Special Toggle Filters */}
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Additional Filters</h3>
            <label className="checkbox-filter-label">
              <input 
                type="checkbox" 
                checked={isFeaturedOnly}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if (e.target.checked) {
                    newParams.set("featured", "true");
                  } else {
                    newParams.delete("featured");
                  }
                  newParams.set("page", "1");
                  setSearchParams(newParams);
                }}
                className="filter-checkbox"
              />
              <span>Featured Only</span>
            </label>
          </div>
 
          {/* Reset Filters */}
          <button className="reset-filters-btn" onClick={clearAllFilters}>
            <SlidersHorizontal size={14} />
            <span>Reset All Filters</span>
          </button>
        </aside>
 
        {/* Product Catalog Results */}
        <section className="product-results-catalog">
          <div className="catalog-status-header">
            <p className="catalog-counter font-inter">
              Showing <span className="highlight">{productsCount}</span> travel merchandise items
            </p>
            
            <div className="catalog-sort-select-wrapper">
              <span className="sort-label">Sort By:</span>
              <select 
                value={sortBy}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if (e.target.value) {
                    newParams.set("sort", e.target.value);
                  } else {
                    newParams.delete("sort");
                  }
                  newParams.set("page", "1");
                  setSearchParams(newParams);
                }}
                className="catalog-sort-dropdown"
              >
                <option value="">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A-Z</option>
                <option value="name_desc">Name: Z-A</option>
              </select>
            </div>

            {isFeaturedOnly && (
              <span className="featured-badge font-inter">Featured Selection Active</span>
            )}
          </div>

          {selectedCategory && (
            (() => {
              const parentId = selectedCategory.parent || selectedCategory.id;
              const subcats = categories.filter(c => c.parent === parentId);
              const parentObj = selectedCategory.parent 
                ? categories.find(c => c.id === selectedCategory.parent)
                : selectedCategory;
                
              if (subcats.length > 0) {
                return (
                  <div className="subcategory-pills-row font-inter">
                    <button
                      className={`subcat-pill-btn ${selectedCategory.id === parentId ? "active" : ""}`}
                      onClick={() => handleCategorySelect(parentObj)}
                    >
                      All {parentObj?.name}
                    </button>
                    {subcats.map(subcat => (
                      <button
                        key={subcat.id}
                        className={`subcat-pill-btn ${selectedCategory.id === subcat.id ? "active" : ""}`}
                        onClick={() => handleCategorySelect(subcat)}
                      >
                        {subcat.name}
                      </button>
                    ))}
                  </div>
                );
              }
              return null;
            })()
          )}

          {loading ? (
            /* Premium skeleton loading cards grid */
            <div className="product-grid-catalog">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="product-card skeleton-card">
                  <div className="skeleton-image" />
                  <div className="skeleton-info">
                    <div className="skeleton-line" style={{ width: "30%" }} />
                    <div className="skeleton-line" style={{ width: "80%" }} />
                    <div className="skeleton-line" style={{ width: "50%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="empty-catalog-state font-inter">
              <AlertCircle size={48} className="empty-icon" />
              <h3>No Merchandise Found</h3>
              <p>We couldn't find any products matching your current selected filters. Try broadening your criteria or reset the filters.</p>
              <button className="empty-action-btn" onClick={clearAllFilters}>
                Browse All Items
              </button>
            </div>
          ) : (
            /* Gorgeous Product Cards Grid */
            <div className="product-grid-catalog">
              {products.map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </div>
          )}

          {/* Beautiful Numbered Pagination */}
          {!loading && totalPages > 1 && (
            <OrderPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(pageNum) => {
                setPage(pageNum);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        </section>

      </main>
      <Footer />
    </div>
  );
}
