import React, { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Stars from "../components/Stars.jsx";
import GradientBackground from "../components/GradientBackground.jsx";

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
      <div className="page-container">
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
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="#18a498ff" strokeWidth="2"/>
                <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" stroke="#18a498ff" strokeWidth="2"/>
              </svg>
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
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="#18a498ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="#18a498ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8" stroke="#18a498ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H8" stroke="#18a498ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9H8" stroke="#18a498ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#18a498ff" strokeWidth="2"/>
                <path d="M19.4 15C19.2669 15.3031 19.1337 15.6062 19.0006 15.9094C18.5443 16.947 18.0823 17.9808 17.6144 19.0106C17.3273 19.6528 16.579 20 15.8571 20H8.14286C7.42102 20 6.67273 19.6528 6.38561 19.0106C5.91767 17.9808 5.45574 16.947 4.99939 15.9094C4.86626 15.6062 4.73314 15.3031 4.6 15" stroke="#18a498ff" strokeWidth="2" strokeLinecap="round"/>
                <path d="M4.6 9C4.73314 8.69687 4.86626 8.39375 4.99939 8.09063C5.45574 7.05302 5.91767 6.01923 6.38561 4.98942C6.67273 4.34718 7.42102 4 8.14286 4H15.8571C16.579 4 17.3273 4.34718 17.6144 4.98942C18.0823 6.01923 18.5443 7.05302 19.0006 8.09063C19.1337 8.39375 19.2669 8.69687 19.4 9" stroke="#18a498ff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
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
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="#18a498ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3C13.6672 3 15.3161 3.3519 16.8457 4.03538C18.3753 4.71886 19.7508 5.71993 20.8839 6.97631C22.0169 8.23269 22.8828 9.71717 23.4251 11.3334C23.9674 12.9496 24.174 14.6622 24.0329 16.3628C23.8918 18.0634 23.4064 19.7146 22.6075 21.2137C21.8085 22.7128 20.713 24.0264 19.393 25.0683C18.073 26.1102 16.5576 26.8573 14.9524 27.2631C13.3473 27.6689 11.6874 27.725 10.0655 27.4281C8.4435 27.1313 6.8967 26.4878 5.52753 25.5383C4.15836 24.5888 2.99787 23.3538 2.125 21.9167" stroke="#18a498ff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
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
      
      <style jsx>{`
        .page-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .contribution-workflow {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 20px;
          margin: 40px 0;
        }
        
        .contribution-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
          margin: 60px 0;
          padding: 0 20px;
        }
        
        .contribution-card {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 40px 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          height: 100%;
          min-height: 380px;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        
        .contribution-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #4ab9e2ff, #057f88ff);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        
        .contribution-card:hover::before {
          transform: scaleX(1);
        }
        
        .contribution-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }
        
        .card-icon {
          margin-bottom: 25px;
          padding: 20px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .contribution-card:hover .card-icon {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
        }
        
        .card-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 20px 0;
          color: white;
          line-height: 1.3;
        }
        
        .card-description {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          font-size: 1rem;
          margin: 0;
          flex: 1;
          display: flex;
          align-items: center;
        }
        
        .card-list {
          text-align: left;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          font-size: 0.95rem;
          margin: 0;
          padding-left: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
        }
        
        .card-list li {
          margin-bottom: 8px;
          position: relative;
        }
        
        .card-list li:last-child {
          margin-bottom: 0;
        }
        
        .card-list a {
          color: #1995aeff;
          text-decoration: none;
          transition: color 0.3s ease;
          font-weight: 500;
        }
        
        .card-list a:hover {
          color: #1995aeff;
          text-decoration: underline;
        }
        
        .card-list strong {
          color: #1995aeff;
          font-weight: 600;
        }
          
        .workflow-step {
          flex: 1;
          min-width: 300px;
          max-width: 450px;
        }
        
        .step-box {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          height: 100%;
        }
        
        .step-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #4A90E2, #6C63FF);
          color: white;
          border-radius: 50%;
          font-weight: bold;
          margin-bottom: 16px;
        }
        
        .step-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 10px;
        }
        
        @media (max-width: 768px) {
          .contribution-workflow {
            flex-direction: column;
          }
          
          .step-arrow {
            transform: rotate(90deg);
            padding: 10px 0;
          }
        }
        
        .step-box h3 {
          margin-top: 0;
          color: #4A90E2;
        }
        
        .step-box p, .step-box li {
          color: rgba(255, 255, 255, 0.85);
        }
        
        .step-box ol, .step-box ul {
          padding-left: 20px;
        }
        
        .step-box a {
          color: #6C63FF;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        
        .step-box a:hover {
          color: #4A90E2;
          text-decoration: underline;
        }
        
        .contributors-section {
          margin: 60px 0 80px 0;
          padding-bottom: 40px;
        }
        
        .contributors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }
        
        .contributor-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .contributor-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        
        .contributor-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin-bottom: 15px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          transition: border-color 0.3s ease;
        }
        
        .contributor-card:hover .contributor-avatar {
          border-color: #4A90E2;
        }
        
        .contributor-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .contributor-name {
          font-weight: bold;
          margin: 0 0 8px 0;
          color: white;
          font-size: 1.1em;
        }
        
        .contributor-data {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9em;
        }
        
        @media (max-width: 768px) {
          .contributors-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
          }
          
          .contributor-card {
            padding: 15px;
          }
          
          .contributor-avatar {
            width: 60px;
            height: 60px;
          }
        }
        
        @media (max-width: 480px) {
          .contributors-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </>
  );
}