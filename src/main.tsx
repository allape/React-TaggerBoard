import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App
      urls={[
        "http://127.0.0.1:8080/IMG_0421.jpeg",
        "http://127.0.0.1:8080/miyu.png",
      ]}
    />
  </StrictMode>,
);
