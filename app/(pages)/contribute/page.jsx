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
import useTranslation from "../../(core)/hooks/useTranslation.ts";
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
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  return (
    <div
      className={`contribution-page-container ${isCompleted ? "notranslate" : ""}`}
    >
      <h1 className="title text-3xl">{t("Contribute to PhysicsHub")}</h1>
      <p>
        {t(
          "PhysicsHub is an open-source project: anyone can help make it better by adding simulations, improving the code, or creating new educational resources."
        )}
      </p>

      <div className="contribution-grid">
        <div className="contribution-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <h3 className="card-title">{t("Who can contribute")}</h3>
          <p className="card-description">
            {t(
              "Anyone can contribute to this project, even if you aren't a programmer. We need people that want to write the theory part or just to give us some new ideas."
            )}
          </p>
        </div>

        <div className="contribution-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faFileCode} />
          </div>
          <h3 className="card-title">{t("How to contribute")}</h3>
          <ol className="card-list">
            <li>
              {t("Open the repository on")}{" "}
              <a
                href="https://github.com/physicshub/physicshub.github.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("GitHub")}
              </a>
            </li>
            <li>{t("Read the rules in CONTRIBUTING.md")}</li>
            <li>{t("Follow the instruction in the README.md")}</li>
            <li>{t("Modify the source code")}</li>
            <li>
              {t("Submit a")} <strong>{t("pull request")}</strong>
            </li>
            <li>{t("Wait it to be accepted")}</li>
          </ol>
        </div>

        <div className="contribution-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faGift} />
          </div>
          <h3 className="card-title">{t("What contributors get")}</h3>
          <ul className="card-list">
            <li>{t("Discord special role")}</li>
            <li>{t("Link profile in the README.md")}</li>
            <li>
              {t("Link profile in the section")}{" "}
              <Link href="/contribute#contributors">{t("below")}</Link>
            </li>
          </ul>
        </div>

        <div className="contribution-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faHandsHelping} />
          </div>
          <h3 className="card-title">{t("Other ways to help")}</h3>
          <ul className="card-list">
            <li>{t("Report bugs or errors")}</li>
            <li>{t("Translate the site into other languages")}</li>
            <li>{t("Write theory about simulations")}</li>
          </ul>
        </div>
      </div>

      <p>
        {t("Join the community on")}{" "}
        <a
          href="https://discord.gg/hT68DTcwfD"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("Discord")}
        </a>{" "}
        {t("and talk with fans and contributors!")}
      </p>

      <hr />
      <Suspense fallback={<Skeleton />}>
        <ContributorsSection />
      </Suspense>
    </div>
  );
}
