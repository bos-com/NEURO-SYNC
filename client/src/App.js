import React from "react";
import Home from "./pages/Home";
import LanguageSelector from "./components/LanguageSelector";
import { useTranslation } from "react-i18next";

export default function App() {
  const { t } = useTranslation();
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
