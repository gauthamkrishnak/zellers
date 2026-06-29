import { createSlice } from "@reduxjs/toolkit";
import productsData from "../../data/products";

const initialState = {
  products: productsData,
};

const productsSlice = createSlice({
  name: "products",

  initialState,

  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },

    addProduct: (state, action) => {
      state.products.push(action.payload);
    },

    deleteProduct: (state, action) => {
      state.products = state.products.filter(
        (product) => product.id !== action.payload,
      );
    },
  },
});

export const { setProducts, addProduct, deleteProduct } = productsSlice.actions;

export default productsSlice.reducer;
