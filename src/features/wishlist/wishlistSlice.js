import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWishlistItems, toggleWishlistItem } from "../../services/wishlistService";
import { toast } from "react-toastify";

// Helper to extract clean error message from Axios/DRF responses
const getErrorMessage = (error) => {
  const data = error.response?.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    if (data.error) return data.error;
    if (data.detail) return data.detail;
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const val = data[firstKey];
      if (Array.isArray(val)) return val[0];
      if (typeof val === "string") return val;
    }
  }
  return error.message || "Failed to complete request";
};

// Async thunk to fetch wishlist items
export const getWishlist = createAsyncThunk(
  "wishlist/getWishlist",
  async (params, { rejectWithValue }) => {
    try {
      const response = await fetchWishlistItems(params);
      return response.data; // DRF paginated response: { count, next, previous, results }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch wishlist");
    }
  }
);

// Async thunk to toggle wishlist item
export const toggleWishlist = createAsyncThunk(
  "wishlist/toggleWishlist",
  async ({ productId, productName }, { rejectWithValue }) => {
    try {
      const response = await toggleWishlistItem(productId);
      const data = response.data; // { message, in_wishlist }
      
      // Show appropriate toast notification
      if (data.in_wishlist) {
        toast.success("Product added to wishlist!");
      } else {
        toast.info("Product removed from wishlist.");
      }
      
      return { productId, inWishlist: data.in_wishlist, data };
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const initialState = {
  items: [],
  wishlistedProductIds: [],
  loading: false,
  error: null,
  count: 0,
  totalPages: 1,
  currentPage: 1,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.wishlistedProductIds = [];
      state.loading = false;
      state.error = null;
      state.count = 0;
      state.totalPages = 1;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // getWishlist
      .addCase(getWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || [];
        state.count = action.payload.count || 0;
        
        // Wishlist uses a page size of 8 as defined in Django views
        state.totalPages = Math.ceil((action.payload.count || 0) / 8);
        
        // Sync the wishlistedProductIds array with all fetched items
        // Extract product IDs from results (each item is { id, product, added_at })
        const ids = (action.payload.results || []).map(item => item.product?.id).filter(Boolean);
        // Note: this only represents the current page, but toggle status maintains general state.
        // To be safe, we merge these IDs with any already in state.
        state.wishlistedProductIds = Array.from(new Set([...state.wishlistedProductIds, ...ids]));
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch wishlist";
      })
      
      // toggleWishlist
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, inWishlist } = action.payload;
        
        if (inWishlist) {
          if (!state.wishlistedProductIds.includes(productId)) {
            state.wishlistedProductIds.push(productId);
          }
        } else {
          state.wishlistedProductIds = state.wishlistedProductIds.filter(id => id !== productId);
          // Also remove from items list if we are currently looking at the wishlist page
          state.items = state.items.filter(item => item.product?.id !== productId);
          state.count = Math.max(0, state.count - 1);
          state.totalPages = Math.ceil(state.count / 8);
        }
      })
      // Clear product from wishlist when added to cart
      .addCase("cart/addVariantToCart/fulfilled", (state, action) => {
        const productId = action.meta.arg?.productId;
        if (productId) {
          state.wishlistedProductIds = state.wishlistedProductIds.filter(id => id !== productId);
          state.items = state.items.filter(item => item.product?.id !== productId);
          state.count = Math.max(0, state.count - 1);
          state.totalPages = Math.ceil(state.count / 8);
        }
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
