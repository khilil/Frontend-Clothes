import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import './index.css'
import './styles/responsive-fix.css'
import { Provider, useDispatch } from "react-redux";
import { store } from "./app/store";





import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = "1017921633008-kflvu6sj2cq3nrat9i3d1mqipb420eoc.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <React.StrictMode>
      <Provider store={store}>
        <HelmetProvider>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </GoogleOAuthProvider>
        </HelmetProvider>
      </Provider>
    </React.StrictMode>
  </>
);
