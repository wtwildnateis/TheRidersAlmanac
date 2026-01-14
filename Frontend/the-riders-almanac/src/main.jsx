import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import ToastHost, { showToast } from "./utils/ToastHost.jsx";

window.alert = (msg) => {
  showToast(String(msg), { type: "error" }); // or "info" if you prefer
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
          <ToastHost />

    </BrowserRouter>
  </React.StrictMode>
);