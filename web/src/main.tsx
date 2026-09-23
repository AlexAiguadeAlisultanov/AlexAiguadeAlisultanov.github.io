import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const arrel = document.getElementById("arrel");
if (arrel) createRoot(arrel).render(<StrictMode><App /></StrictMode>);
