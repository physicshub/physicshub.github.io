import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFlask,
  faChalkboardTeacher,
  faGlobe,
  faCodeBranch,
  faLanguage,
  faComments,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../../(core)/components/Button.jsx";

const stats = [
  {
    label: "Interactive labs",
    value: "15+",
    helper: "Classical mechanics, waves, and more coming soon.",
  },
  {
    label: "Community contributors",
    value: "60+",
    helper: "Developers, educators, and curious learners.",
  },
  {
    label: "Open-source commits",
    value: "400+",
    helper: "Continuous refinements & bug fixes.",
  },
];

const highlights = [
  {
    icon: faFlask,
    title: "Hands-on first",
    description:
      "Each simulation is tuned with real formulas and reacts instantly, so learners can verify hypotheses before memorizing theory.",
  },
  {
    icon: faChalkboardTeacher,
    title: "Guided storytelling",
    description:
      "We pair visuals with bite-sized explanations, making even advanced topics approachable for classrooms and self-learners.",
  },
  {
    icon: faGlobe,
    title: "Accessible everywhere",
    description:
      "A lightweight Next.js stack, translator support, and responsive layouts keep PhysicsHub fast on any device or theme.",
  },
];

const buildPrinciples = [
  "Live controls and theory sit side by side.",
  "Light / dark mode ready for every simulation.",
  "Accurate physics vetted with educators.",
  "Documented configs for remixing and forks.",
];

const callouts = [
  {
    icon: faCodeBranch,
    title: "Ship a new idea",
    description:
      "Pick an issue, add a feature, or craft a brand new simulation powered by p5.js and our shared configs.",
    link: {
      href: "https://github.com/physicshub/physicshub.github.io",
      label: "Open the repo",
      external: true,
    },
  },
  {
    icon: faLanguage,
    title: "Translate & explain",
    description:
      "Help us localize the UI, improve the written theory, or share lesson notes that make experiments easier to follow.",
    link: {
      href: "/contribute",
      label: "Translation tips",
      external: false,
    },
  },
  {
    icon: faComments,
    title: "Join the conversation",
    description:
      "Drop feedback, share experiments, or plan the next community study jam together with fellow physics fans.",
    link: {
      href: "https://discord.gg/hT68DTcwfD",
      label: "Join Discord",
      external: true,
    },
  },
];

export default function About() {
  return (
    <div className="page-container about-page">
      <section className="about-hero">
        <div className="about-hero__text">
          <p className="about-eyebrow">Open-source physics playground</p>
          <h1 className="title">Interactive science that feels tangible</h1>
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

      <section className="about-grid">
        {highlights.map((highlight) => (
          <article className="about-card" key={highlight.title}>
            <div className="about-icon">
              <FontAwesomeIcon icon={highlight.icon} />
            </div>
            <h3>{highlight.title}</h3>
            <p>{highlight.description}</p>
          </article>
        ))}
      </section>

      <section className="about-callouts">
        {callouts.map((callout) => (
          <article className="about-callout" key={callout.title}>
            <div className="about-icon about-icon--ghost">
              <FontAwesomeIcon icon={callout.icon} />
            </div>
            <div className="about-callout__content">
              <h4>{callout.title}</h4>
              <p>{callout.description}</p>
            </div>
            {callout.link.external ? (
              <a
                className="about-link"
                href={callout.link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {callout.link.label} →
              </a>
            ) : (
              <Link className="about-link" href={callout.link.href}>
                {callout.link.label} →
              </Link>
            )}
          </article>
        ))}
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

      <section className="about-cta-band">
        <div>
          <h3>Have a simulation idea or lesson to share?</h3>
          <p>
            Open an issue, share theory notes, or hop into the next Discord
            chat—the roadmap stays community-driven and transparent.
          </p>
        </div>
        <div className="about-cta">
          <Button link="/contribute" content="View contribution guide" />
          <a
            className="about-secondary-link"
            href="https://discord.gg/hT68DTcwfD"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join Discord
          </a>
        </div>
      </section>
    </div>
  );
}
