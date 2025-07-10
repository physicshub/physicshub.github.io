import React, { useRef, useEffect } from 'react'
import p5 from "p5"

function Screen({ sketch }) {
  const containerRef = useRef(null)
  const p5Instance   = useRef(null)

  useEffect(() => {
  if (p5Instance.current) {
    p5Instance.current.remove()
    p5Instance.current = null
  }

  p5Instance.current = new p5(sketch, containerRef.current)

  return () => {
    if (p5Instance.current) {
      p5Instance.current.remove()
      p5Instance.current = null
    }
  }
}, [sketch])

  return (
    <div
      ref={containerRef}
      className="screen"
      id="Screen"
    >
    </div>
  )
}

export default Screen
