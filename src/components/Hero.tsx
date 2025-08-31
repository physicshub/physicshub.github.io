import React from "react";
import { Link } from "react-router-dom"
import HeroBackground from "./HeroBackground";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faListNumeric, faPaperclip, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import chaptersData from "../data/chapters.js";
import Stars from "./Stars.jsx";

export function Hero() {

  function getChaptersAmount() {
    if (Array.isArray(chaptersData)) {
      return chaptersData.length;
    } else if (typeof chaptersData === "object" && chaptersData !== null) {
      return Object.keys(chaptersData).length;
    }
    return 0;
  }


  return (
    <section className="ph-hero" aria-label="Hero">
      <Stars
        count={14}
        speed={1}
        direction="down-right"
        color="#AEE3FF"
        opacity={0.9}
        zIndex={-1}
      />
      <div className="ph-hero__bg" aria-hidden="true">
        <HeroBackground />
        <div className="ph-hero__radial" />
      </div>

      <div className="ph-hero__container">
        <p className="ph-hero__eyebrow">PhysicsHub</p>
        <h1 className="ph-hero__title">Best website to learn physics easily.</h1>
        <p className="ph-hero__subtitle">
          Experience physics in real time, uncover the concepts behind the formulas, and instantly see how they apply to the real world.
        </p>

        <div className="ph-hero__ctas">
          <Link className="ph-btn ph-btn--primary" to="/simulations">
            Go to Simulations
          </Link>
          <Link className="ph-btn ph-btn--ghost" to="/contribute">
            Contribute
          </Link>
        </div>

        <div className="ph-hero__stats" role="list" aria-label="Stats">
          <div className="ph-stat" role="listitem">
            <FontAwesomeIcon icon={faListNumeric}/>
            <span className="ph-stat__value">Chapters:</span>
            <span className="ph-stat__label">{getChaptersAmount()}</span>
          </div>
          <div className="ph-stat" role="listitem">
            <FontAwesomeIcon icon={faGithub}/>
            <span className="ph-stat__value">Gitub:</span>
            <span className="ph-stat__label">Open Source</span>
          </div>
          <div className="ph-stat" role="listitem">
            <FontAwesomeIcon icon={faPaperclip}/>
            <span className="ph-stat__value">License:</span>
            <span className="ph-stat__label">MIT</span>
          </div>
        </div>
      </div>
    </section>
  );
}
