import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.tsx";
import Image1 from "./asset/girl-5014099_1920.jpg";
import Image2 from "./asset/girl-7357492_1920.jpg";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App
      style={{ width: "100vw", height: "100vh" }}
      urls={[Image1, Image2]}
      onReport={(url, boxes) => console.log(url, boxes)}
    />
  </StrictMode>,
);
