import React from "react";
import Home from "./pages/Home";
import LanguageSelector from "./components/LanguageSelector";
import { useTranslation } from "react-i18next";

export default function App() {
  const { t, ready } = useTranslation();
  
  // Wait for i18n to be ready before rendering
  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading NeuroSync...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 bg-gray-800 flex justify-between items-center">
        <span className="text-2xl font-bold">🧠 {t("title")}</span>
        <LanguageSelector />
      </header>
      <main className="flex-1 p-4">
        <Home />
      </main>
    </div>
  );
}
