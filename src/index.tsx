import React from "react";
import ReactDOM from "react-dom/client";

import fontStyles from "@fontsource/raleway/index.css?inline";

import App from "./App.tsx";
import { SentryEvent } from "./types.ts";
import globalStyles from "./index.css?inline";
import dataCache from "./lib/dataCache.ts";

const DEFAULT_RELAY = "http://localhost:8969/stream";

function createStyleSheet(styles: string) {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(styles);
  return sheet;
}

export function init({
  fullScreen = false,
  relay,
}: {
  fullScreen?: boolean;
  relay?: string;
} = {}) {
  if (typeof document === "undefined") return;

  connectToRelay(relay);

  // build shadow dom container to contain styles
  const docRoot = document.createElement("div");
  const shadow = docRoot.attachShadow({ mode: "open" });
  const appRoot = document.createElement("div");
  appRoot.style.position = "absolute";
  appRoot.style.top = "0";
  appRoot.style.left = "0";
  appRoot.style.right = "0";
  shadow.appendChild(appRoot);
  shadow.adoptedStyleSheets = [
    createStyleSheet(fontStyles),
    createStyleSheet(globalStyles),
  ];

  ReactDOM.createRoot(appRoot).render(
    <React.StrictMode>
      <App fullScreen={fullScreen} />
    </React.StrictMode>
  );

  window.addEventListener("load", () => {
    console.log("[spotlight] Injecting into application");

    document.body.append(docRoot);
  });
}

export function pushEvent(event: SentryEvent) {
  dataCache.pushEvent(event);
}

function connectToRelay(relay: string = DEFAULT_RELAY) {
  console.log("[Spotlight] Connecting to relay");
  const source = new EventSource(relay || DEFAULT_RELAY);
  source.onmessage = (event) => {
    pushEvent(JSON.parse(event.data));
  };
}
