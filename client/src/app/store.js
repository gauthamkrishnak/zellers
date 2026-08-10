import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "../features/products/productsSlice";
import wishlistReducer from "../features/wishlist/wishlistSlice";
import chatReducer from "../features/chat/chatSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    wishlist: wishlistReducer,
    chat: chatReducer,
    notifications: notificationsReducer,
  },
});
