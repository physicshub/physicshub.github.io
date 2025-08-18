import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function About() {
  return (
    <>
      <Header/>
      <div className="page-container">
        <h1 className="title"><strong>About PhysicsHub</strong></h1>
        <p>
          <strong>PhysicsHub</strong> is an <strong>open‑source</strong> platform that provides <strong>free</strong> and <strong>interactive</strong> physics simulations,
          designed to help <strong>students</strong>, <strong>teachers</strong>, and <strong>enthusiasts</strong> explore scientific concepts in a <strong>visual</strong> and
          <strong> intuitive</strong> way. Our simulations combine funny simulations and engaging theory with a
          modern interface, making it easier to bridge the gap between complex concepts and engaging interations.
        </p>
        <p>
          Beyond the simulations themselves, PhysicsHub serves as a <strong>collaborative space</strong> where <strong>anyone</strong> can
          contribute in different ways, check <a href="/Contribute">contributing page</a> for more info.
        </p>

        <h3 className="title"><strong>Our Mission</strong></h3>
        <p>
          We believe that knowledge should be accessible to everyone, but it needs also to be easily understandable that’s why we created this <strong>educational tool</strong> that is free, open, and easy to use. 
        </p>
        <p>
          Every simulation we built is guided by the principle that learning is most effective when it’s
          <strong> interactive</strong> and <strong>enjoyable</strong>.
        </p>

        <h3 className="title"><strong>Authors</strong></h3>
        <p>
          Project created and maintained by{" "}
          <a href="https://github.com/mattqdev"><strong>@mattqdev</strong></a> and the{" "}
          <a href="https://discord.gg/hT68DTcwfD"><strong>PhysicsHub community</strong></a>.
        </p>
        <p>
          Discover more about us{" "}
          <a
            href="https://github.com/physicshub/physicshub.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            here.
          </a>
        </p>
      </div>
      <Footer/>
    </>
  );
}
