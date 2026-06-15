import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
  fetchCart, 
  addToCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart 
} from "../../services/cartService";
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

// Async thunk to get cart
export const getCart = createAsyncThunk(
  "cart/getCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Async thunk to add variant to cart
export const addVariantToCart = createAsyncThunk(
  "cart/addVariantToCart",
  async ({ variantId, quantity, productId, productName }, { rejectWithValue }) => {
    try {
      const response = await addToCart(variantId, quantity);
      toast.success(`${productName || "Product"} added to cart!`);
      return response.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// Async thunk to update cart item quantity
export const updateItemQuantity = createAsyncThunk(
  "cart/updateItemQuantity",
  async ({ variantId, quantity, productName }, { rejectWithValue }) => {
    try {
      const response = await updateCartItem(variantId, quantity);
      return { data: response.data, variantId };
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return rejectWithValue({ error: msg, variantId });
    }
  }
);

// Async thunk to remove cart item
export const removeVariantFromCart = createAsyncThunk(
  "cart/removeVariantFromCart",
  async ({ variantId, productName }, { rejectWithValue }) => {
    try {
      const response = await removeCartItem(variantId);
      toast.info(`${productName || "Product"} removed from cart.`);
      return response.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// Async thunk to clear cart
export const clearUserCart = createAsyncThunk(
  "cart/clearUserCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await clearCart();
      toast.info("Cart cleared.");
      return response.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const initialState = {
  cart: null, // holds: { id, items: [], total_items, total_price, discount_total, is_checkout_restricted }
  loading: false,
  updatingItems: {}, //  e.g. { [variantId]: true }
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.cart = null;
      state.loading = false;
      state.updatingItems = {};
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // getCart
      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addVariantToCart
      .addCase(addVariantToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addVariantToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(addVariantToCart.rejected, (state) => {
        state.loading = false;
      })

      // updateItemQuantity
      .addCase(updateItemQuantity.pending, (state, action) => {
        const variantId = action.meta.arg.variantId;
        state.updatingItems[variantId] = true;
      })
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        const { data, variantId } = action.payload;
        state.updatingItems[variantId] = false;
        state.cart = data;
      })
      .addCase(updateItemQuantity.rejected, (state, action) => {
        const variantId = action.meta.arg.variantId;
        state.updatingItems[variantId] = false;
      })

      // removeVariantFromCart
      .addCase(removeVariantFromCart.pending, (state, action) => {
        const variantId = action.meta.arg.variantId;
        state.updatingItems[variantId] = true;
      })
      .addCase(removeVariantFromCart.fulfilled, (state, action) => {
        const variantId = action.meta.arg.variantId;
        state.updatingItems[variantId] = false;
        state.cart = action.payload;
      })
      .addCase(removeVariantFromCart.rejected, (state, action) => {
        const variantId = action.meta.arg.variantId;
        state.updatingItems[variantId] = false;
      })

      // clearUserCart
      .addCase(clearUserCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearUserCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(clearUserCart.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
