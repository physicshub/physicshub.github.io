// src/components/P5Wrapper.jsx
import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

/**
 * A reusable wrapper component to handle the p5.js instance and sketch lifecycle.
 * It abstracts away the boilerplate of creating and removing the canvas.
 */
const P5Wrapper = ({ sketch }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Create a new p5 instance and attach it to the canvas ref.
    const p5Instance = new p5(sketch, canvasRef.current);

    // Cleanup function to remove the p5 instance when the component unmounts.
    return () => {
      p5Instance.remove();
    };
  }, [sketch]); // Rerun the effect if the sketch function changes.

  return <div ref={canvasRef} className="screen" id="Screen" />;
};

export default P5Wrapper;