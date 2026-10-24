"use client";

import { Routes, Route } from "react-router-dom";

import { HomePage } from "@/features/home/pages/HomePage";
// import AnimeListPage from "@/features/anime/pages/AnimeListPage";
// import AnimeDetailPage from "@/features/anime/pages/AnimeDetailPage";
// import LoginPage from "@/features/auth/pages/LoginPage";
// import WatchListPage from "@/features/watch-list/pages/WatchListPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* <Route path="/anime" element={<AnimeListPage />} /> */}
      {/* <Route
        path="/anime/:animeId"
        element={<AnimeDetailPage />}
      /> */}

      {/* <Route path="/login" element={<LoginPage />} /> */}
      {/* <Route path="/watch-list" element={<WatchListPage />} /> */}

      {/* <Route
        path="*"
        element={<h1>404 - Page Not Found</h1>}
      /> */}
    </Routes>
  );
}
