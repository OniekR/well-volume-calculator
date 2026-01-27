import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/globals.css";
import { WellProvider } from "./context/WellContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WellProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WellProvider>
  </React.StrictMode>,
);
