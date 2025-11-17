import { useState, useCallback } from 'react';
import Header from './Header';
import Footer from './Footer';
import Stars from './Stars';
import GradientBackground from './GradientBackground';
import PhysicsPortal from './portal';

export default function Layout({ children, showStars = false, showGradient = false, starColor = "AEE3FF", starOpacity = 0.4 }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [portalActive, setPortalActive] = useState(false);
  const [portalCallback, setPortalCallback] = useState(null);

  const triggerPortal = useCallback((callback) => {
  setPortalCallback(() => callback);
  setPortalActive(true);
}, []);

if (typeof window !== "undefined") {
  window.triggerPortal = triggerPortal;
}

const handlePortalComplete = () => {
  if (portalCallback) portalCallback();

  // allow fade-out to play
  setTimeout(() => {
    setPortalActive(false);
    setPortalCallback(null);
  }, 450);
};


  return (
    <>
      {portalActive && (
        <PhysicsPortal onComplete={handlePortalComplete} />
      )}

      <Header onSearch={setSearchTerm} />
      {showStars && (
        <Stars color={starColor} opacity={starOpacity} zIndex={1} starDensity={0.005} />
      )}
      {showGradient && <GradientBackground />}

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>{children}</div>
        <Footer triggerPortal={triggerPortal}/>
      </div>
    </>
  );
}
