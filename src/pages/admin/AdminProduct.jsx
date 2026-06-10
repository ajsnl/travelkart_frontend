import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { adminFetchProducts, adminFetchProductById, createProduct, updateProduct, deleteProduct, patchProduct, adminFetchBrands } from "../../services/productService";
import { adminFetchCategories } from "../../services/categoryService";
import { toast } from "react-toastify";
import ProductList from "../../components/products/ProductList";
import ProductForm from "../../components/products/ProductForm";
import VariantManager from "../../components/products/VariantManager";
import "./AdminProduct.css";

const cartesianProduct = (arrays) => {
  return arrays.reduce((acc, curr) => {
    return acc.flatMap(d => curr.map(e => [d, e].flat()));
  }, [[]]);
};

const parseBackendError = (errorData) => {
  if (typeof errorData === "string") return errorData;
  if (Array.isArray(errorData)) {
    return errorData.map(item => parseBackendError(item)).join(" ");
  }
  if (typeof errorData === "object" && errorData !== null) {
    return Object.values(errorData).map(item => parseBackendError(item)).join(" ");
  }
  return "";
};

const AdminProduct = () => {
  const { search } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Filters States
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // View States: "list" | "create" | "edit" | "manage-variants"
  const [view, setView] = useState("list");
  const [currentId, setCurrentId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await adminFetchProducts({
        search,
        page,
        category: selectedCategory || undefined,
        brand: selectedBrand || undefined,
      });
      setProducts(res.data.results);
      setCount(res.data.count);
    } catch (err) {
      console.error("Error loading products:", err);
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesDropdown = async () => {
    try {
      const res = await adminFetchCategories({ page_size: 100 });
      setCategories(res.data.results || []);
    } catch (err) {
      console.error("Error loading categories for dropdown:", err);
    }
  };

  const loadBrandsDropdown = async () => {
    try {
      const res = await adminFetchBrands();
      setBrands(res.data || []);
    } catch (err) {
      console.error("Error loading brands list:", err);
    }
  };

  useEffect(() => {
    loadCategoriesDropdown();
    loadBrandsDropdown();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, selectedBrand]);

  useEffect(() => {
    loadProducts();
  }, [search, page, selectedCategory, selectedBrand]);

  // Actions
  const handleAddProductClick = () => {
    setCurrentId(null);
    setSelectedProduct(null);
    setView("create");
  };

  const handleEditProductClick = (product) => {
    setCurrentId(product.id);
    setSelectedProduct(product);
    setView("edit");
  };

  const handleManageVariantsClick = (product) => {
    setSelectedProduct(product);
    setView("manage-variants");
  };

  const handleRefreshSelectedProduct = async () => {
    if (!selectedProduct) return;
    try {
      const res = await adminFetchProductById(selectedProduct.id);
      setSelectedProduct(res.data);
      loadProducts(); // Sync list state
    } catch (err) {
      console.error("Refresh error", err);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      try {
        await deleteProduct(id);
        toast.success("Product deleted successfully.");
        loadBrandsDropdown(); // Refresh dynamic filter values
        if (products.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          loadProducts();
        }
      } catch (err) {
        console.error("Error deleting product:", err);
        toast.error("Failed to delete product.");
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await patchProduct(id, { is_active: !currentStatus });
      toast.success("Status updated successfully.");
      loadProducts();
      if (selectedProduct && selectedProduct.id === id) {
        setSelectedProduct(prev => ({ ...prev, is_active: !currentStatus }));
      }
    } catch (err) {
      console.error("Error toggling active status:", err);
      if (err.response && err.response.data) {
        const errorMsg = parseBackendError(err.response.data);
        toast.error(errorMsg || "Failed to update status.");
      } else {
        toast.error("Failed to update status.");
      }
    }
  };

  // Submit Handler for Creation & Basic Info updates
  const handleFormSubmit = async (formData, options) => {
    setLoading(true);
    try {
      if (view === "create") {
        // Generate initial variant items
        const activeOptions = options.filter(opt => opt.name.trim() !== "" && opt.values.length > 0);
        let generatedVariants = [];
        if (activeOptions.length > 0) {
          const optionNames = activeOptions.map(o => o.name);
          const valueArrays = activeOptions.map(o => o.values);
          const combinations = cartesianProduct(valueArrays);
          
          generatedVariants = combinations.map((combo, idx) => {
            const variantAttrs = {};
            combo.forEach((val, i) => {
              variantAttrs[optionNames[i]] = val;
            });
            const cleanSlug = formData.slug.substring(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, '');
            const tempSku = `${cleanSlug}-${Object.values(variantAttrs).map(v => v.toString().substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '')).join("-")}-${idx + 1}`;
            return {
              sku: tempSku,
              price: "0.00",
              stock: 10,
              attributes: variantAttrs,
              images: []
            };
          });
        }

        const payload = {
          ...formData,
          variants: generatedVariants
        };

        await createProduct(payload);
        toast.success("Product published! Go to Variant Manager to set specific prices/images.");
      } else {
        // Update basic details only (omit variants to preserve them)
        const { variants, ...basicPayload } = formData;
        await updateProduct(currentId, basicPayload);
        toast.success("Product details saved successfully.");
      }

      setView("list");
      loadProducts();
      loadBrandsDropdown(); // Refresh dynamic filter values
    } catch (err) {
      console.error("Save product error", err);
      if (err.response && err.response.data) {
        const errorMsg = parseBackendError(err.response.data);
        toast.error(errorMsg || "Failed to save product.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      {view === "list" && (
        <ProductList
          products={products}
          count={count}
          page={page}
          setPage={setPage}
          loading={loading}
          categories={categories}
          brands={brands}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          onAddProduct={handleAddProductClick}
          onEditProduct={handleEditProductClick}
          onManageVariants={handleManageVariantsClick}
          onDeleteProduct={handleDeleteProduct}
          onToggleActive={handleToggleActive}
        />
      )}

      {(view === "create" || view === "edit") && (
        <ProductForm
          initialData={selectedProduct}
          categories={categories}
          onCancel={() => setView("list")}
          onSubmit={handleFormSubmit}
          loading={loading}
        />
      )}

      {view === "manage-variants" && selectedProduct && (
        <VariantManager
          product={selectedProduct}
          categories={categories}
          onBack={() => setView("list")}
          onEditProduct={() => setView("edit")}
          onRefresh={handleRefreshSelectedProduct}
        />
      )}
    </div>
  );
};

export default AdminProduct;
