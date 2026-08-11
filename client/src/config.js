export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

export const getWebSocketUrl = () => {
  const token = localStorage.getItem("access_token");
  let wsProtocol = "ws:";
  let host = window.location.host;

  if (API_BASE_URL.startsWith("http://") || API_BASE_URL.startsWith("https://")) {
    try {
      const url = new URL(API_BASE_URL);
      wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
      host = url.host;
    } catch (e) {
      console.error("Error parsing API_BASE_URL:", e);
    }
  } else {
    wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  }
  
  return `${wsProtocol}//${host}/ws/chat?token=${token || ""}`;
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("data:")) {
    return imagePath;
  }
  return `${API_BASE_URL}/uploads/${imagePath}`;
};
