import React from "react";
import Link from "next/link";
import Button from "../../(core)/components/Button.jsx";

const stats = [
  {
    label: "Interactive labs",
    value: "6+",
    helper: "Classical mechanics, waves, and more coming soon.",
  },
  {
    label: "Community contributors",
    value: "20+",
    helper: "Developers, educators, and curious learners.",
  },
  {
    label: "Stars on GitHub",
    value: "17+",
    helper: "Open-source and growing fast.",
  },
];

const buildPrinciples = [
  "Live controls and theory sit side by side.",
  "Light / dark mode ready for every simulation.",
  "Accurate physics vetted with educators.",
  "Documented configs for remixing and forks.",
];

export default function About() {
  return (
    <div className="page-container about-page">
      <section className="about-hero">
        <div className="about-hero__text">
          <p className="about-eyebrow">Open-source physics playground</p>
          <h1 className="title">
            Stop memorizing formulas. Start visualizing them.
          </h1>
          <p>
            <strong>PhysicsHub</strong> is an open-source platform where{" "}
            <strong>students</strong>, <strong>teachers</strong>, and{" "}
            <strong>enthusiasts</strong> explore scientific concepts in a{" "}
            <strong>visual</strong> and <strong>intuitive</strong> way. Our
            simulations blend playful experimentation with clear theory to close
            the gap between complex concepts and engaging interactions.
          </p>
          <p>
            Beyond the labs, PhysicsHub is a{" "}
            <strong>collaborative space</strong>—anyone can co-create, review,
            or translate new content. Check the contributing guide to see how
            you can shape the roadmap.
          </p>
          <div className="about-cta">
            <Button link="/simulations" content="Explore simulations" />
            <Link className="about-secondary-link" href="/contribute">
              See how to contribute
            </Link>
          </div>
        </div>
        <div className="about-stats-grid">
          {stats.map((stat) => (
            <div className="about-stat" key={stat.label}>
              <span className="about-stat__value">{stat.value}</span>
              <span className="about-stat__label">{stat.label}</span>
              <p>{stat.helper}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-panels">
        <article className="about-panel">
          <h2>Our mission</h2>
          <p>
            Knowledge should be both <strong>free</strong> and{" "}
            <strong>easy to understand</strong>. PhysicsHub exists to deliver an{" "}
            <strong>educational tool</strong> that anyone can use, remix, and
            share without limits.
          </p>
          <ul className="about-list">
            <li>Explain advanced physics through visuals before formulas.</li>
            <li>Remove paywalls and keep every simulation open-source.</li>
            <li>Invite teachers, students, and hobbyists into the process.</li>
          </ul>
        </article>
        <article className="about-panel">
          <h2>How every simulation is crafted</h2>
          <p>
            Every lab is guided by the belief that learning is most effective
            when it&apos;s <strong>interactive</strong> and{" "}
            <strong>enjoyable</strong>. We sweat the tiny details so the
            experience stays smooth.
          </p>
          <div className="about-chip-grid">
            {buildPrinciples.map((principle) => (
              <span className="about-chip" key={principle}>
                {principle}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="about-authors">
        <p>
          Project created and maintained by{" "}
          <a
            href="https://github.com/mattqdev"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>@mattqdev</strong>
          </a>{" "}
          and the{" "}
          <a
            href="https://discord.gg/hT68DTcwfD"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>PhysicsHub community</strong>
          </a>
          .
        </p>
        <p>
          Discover more about us{" "}
          <a
            href="https://github.com/physicshub/physicshub.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          .
        </p>
      </section>
    </div>
  );
}
