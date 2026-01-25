// app/pages/contribute.jsx
"use client";
import React, { Suspense } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Skeleton from "../../(core)/components/ContributorsSectionSkeleton";
import {
  faUsers,
  faFileCode,
  faGift,
  faHandsHelping,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

// Lazy load del componente ContributorsSection con ritardo artificiale (3s)
const ContributorsSection = React.lazy(
  () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(import("../../(core)/components/ContributorsSection.jsx"));
      }, 3000); // 3000ms = 3 secondi di delay
    })
);

export default function Contribute() {
  return (
    <div className="contribution-page-container">
      <h1 className="title text-3xl">Contribute to PhysicsHub</h1>
      <p>
        PhysicsHub is an open-source project: anyone can help make it better by
        adding simulations, improving the code, or creating new educational
        resources.
      </p>

      <div className="contribution-grid">
        <div className="contribution-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <h3 className="card-title">Who can contribute</h3>
          <p className="card-description">
            Anyone can contribute to this project, even if you aren&apos;t a
            programmer. We need people that want to write the theory part or
            just to give us some new ideas.
          </p>
        </div>

        <div className="contribution-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faFileCode} />
          </div>
          <h3 className="card-title">How to contribute</h3>
          <ol className="card-list">
            <li>
              Open the repository on{" "}
              <a
                href="https://github.com/physicshub/physicshub.github.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
            <li>Read the rules in CONTRIBUTING.md</li>
            <li>Follow the instruction in the README.md</li>
            <li>Modify the source code</li>
            <li>
              Submit a <strong>pull request</strong>
            </li>
            <li>Wait it to be accepted</li>
          </ol>
        </div>

        <div className="contribution-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faGift} />
          </div>
          <h3 className="card-title">What contributors get</h3>
          <ul className="card-list">
            <li>Discord special role</li>
            <li>Link profile in the README.md</li>
            <li>
              Link profile in the section{" "}
              <Link href="/contribute#contributors">below</Link>
            </li>
          </ul>
        </div>

        <div className="contribution-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faHandsHelping} />
          </div>
          <h3 className="card-title">Other ways to help</h3>
          <ul className="card-list">
            <li>Report bugs or errors</li>
            <li>Translate the site into other languages</li>
            <li>Write theory about simulations</li>
          </ul>
        </div>
      </div>

      <p>
        Join the community on{" "}
        <a
          href="https://discord.gg/hT68DTcwfD"
          target="_blank"
          rel="noopener noreferrer"
        >
          Discord
        </a>{" "}
        and talk with fans and contributors!
      </p>

      <hr />
      <Suspense fallback={<Skeleton />}>
        <ContributorsSection />
      </Suspense>
    </div>
  );
}
