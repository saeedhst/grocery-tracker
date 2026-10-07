import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import '../index.css';
import React from "react";
import {BrowserRouter} from "react-router-dom";

const el = document.getElementById("root");
const root = ReactDOM.createRoot(el);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </React.StrictMode>
)