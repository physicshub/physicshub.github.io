// src/pages/home.jsx
import { useState } from 'react';
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import FullLandingPage from "../components/FullLandingPage.jsx";

export function Home() {
  return (
    <>
      <Header/>
      <FullLandingPage />
      <Footer />
    </>
  );
}
