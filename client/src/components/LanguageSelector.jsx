import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLang = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select
      onChange={changeLang}
      value={i18n.language}
      className="bg-gray-700 text-white px-2 py-1 rounded ml-2"
    >
      <option value="en">EN</option>
      <option value="es">ES</option>
      <option value="fr">FR</option>
      <option value="sw">SW</option>
      <option value="lg">LG</option>
    </select>
  );
}
