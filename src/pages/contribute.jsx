import React, { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Stars from "../components/Stars.jsx";
import GradientBackground from "../components/GradientBackground.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faFileCode, faGift, faHandsHelping } from "@fortawesome/free-solid-svg-icons";


export default function Contribute() {
  const [contributors, setContributors] = useState([]);

  async function getContributors(page = 1) {
    const request = await fetch(
      `https://api.github.com/repos/physicshub/physicshub.github.io/contributors?per_page=100&page=${page}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return await request.json();
  }

  async function getAllContributors() {
    let contributorsList = [];
    let page = 1;
    let list = [];

    do {
      list = await getContributors(page);
      contributorsList = contributorsList.concat(list);
      page++;
    } while (list.length > 0);

    return contributorsList;
  }

  useEffect(() => {
    getAllContributors().then((data) => {
      setContributors(data);
    });
  }, []);

  return (
    <>
      <Header />
      <div className="contribution-page-container">
        <Stars color="#AEE3FF" opacity={0.4} starDensity={0.005}/>
        <GradientBackground/>
        <h1 className="title">Contribute to PhysicsHub</h1>
        <p>
          PhysicsHub is an open-source project: anyone can help make it better
          by adding simulations, improving the code, or creating new
          educational resources.
        </p>

        <div className="contribution-grid">
          <div className="contribution-card">
            <div className="card-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <h3 className="card-title">Who can contribute</h3>
            <p className="card-description">
              Anyone can contribute to this project, even if you aren't a
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
              <li>Submit a <strong>pull request</strong></li>
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
              <li>Link profile in the section <a href="#contributors">below</a></li>
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

        <hr/>
        <div className="contributors-section" id="contributors">
          <h2 className="title">Project Contributors</h2>
          <div className="contributors-grid">
            {contributors.map((contributor) => (
              <div key={contributor.id} className="contributor-card">
                <a
                  href={contributor.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    className="contributor-avatar"
                  />
                </a>
                <div className="contributor-info">
                  <p className="contributor-name">{contributor.login}</p>
                  <p className="contributor-data">
                    {contributor.contributions} {contributor.contributions === 1 ? 'commit' : 'commits'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}