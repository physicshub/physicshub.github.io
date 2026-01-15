# 📚 Full Guide for Contributors

> **Please read carefully — every section is important!**

## 🎯 Our Mission

PhysicsHub exists to help **students** understand physics through **interactive simulations** and **clear explanations**.  
It will **always** be:

- Easy to use
- Free and open to all
- Focused on improving physics learning

## 🤝 Contributing

We welcome contributions from everyone.  
There are **no overly strict rules**, but please:

- Respect the project's mission
- Keep the code clean and maintainable
- Use your experience to set a good example for others

You are free to **rewrite or improve** parts of the code if you believe it benefits the project.

## 🔄 Pull Request Process — Step-by-Step (Beginner Friendly)

This guide will walk you through **setting up the project locally** and creating a **Pull Request (PR)**, even if it’s your first time contributing to an open-source project.

---

### 🛠️ 1. Setting up the project locally

0. **Install Dependences**
   - Install [Node.js](https://nodejs.org/en/download)
   - Install [Git](https://git-scm.com/downloads)
   - Check if [Npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) and Node.js are installed with `npm -v` and `node -v`

1. **Fork the repository**
   - Go to the project’s [GitHub page](https://github.com/physicshub/physicshub.github.io).
   - Click the **Fork** button (top right) to create a copy of the repository under your account.

2. **Clone your fork to your computer**

   ```bash
   git clone https://github.com/YOUR-USERNAME/physicshub.github.io.git
   ```

3. **Navigate into the project folder**

   ```bash
   cd physicshub.github.io
   ```

4. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   - Open your browser at `http://localhost:3000` to see the site running locally.

---

### 2️⃣ Make your changes

- You can:
  - Add new simulations
  - Improve UI/UX
  - Fix bugs
  - Update documentation
- Keep your code **clean, readable, and consistent** with the existing style.
  If you want to do some other things than these, ask to @mattqdev via discord or github issue.

---

### 3️⃣ Versioning

- Versioning is now completely automatic, it uses semantic‑release github action since Nov 11, 2025 (see .github/workflows/release.yml for more details).
- PLEASE DON'T TOUCH "VERSION" PARAMETER IN PACKAGE.json

---

### 4️⃣ UI Changes

If you made **significant changes** to the interface:

1. Take screenshots of the updated UI.
2. Create a folder in:
   ```
   public/screenshots/NEW_VERSION
   ```
3. Save all screenshots there.
4. The main screenshot (usually the homepage) should be named:
   ```
   main.png
   ```

---

### 5️⃣ Commit and Push

1. **Stage your changes**
   ```bash
   git add .
   ```
2. **Write a clear commit message**
   ```bash
   git commit -m "<Commit message>"
   ```
3. **Push your branch to your fork**
   ```bash
   git push
   ```

---

### 6️⃣ Create the Pull Request (PR)

1. Go to your fork on GitHub.
2. Click **Compare & pull request**.
3. Fill in the PR description:
   - **What** you changed
   - **Why** you changed it
   - Link related issues (e.g., `Closes #12`)
   - Add screenshots/GIFs if relevant
4. Make sure the base branch is:
   ```
   base repository: physicshub/physicshub.github.io
   base: main
   ```
   The title of your pull request should follow the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0/). When a pull request is merged to the main branch, all changes are going to be squashed into a single commit. The message of this commit will be the title of the pull request. And for every release, the commit messages are used to generate the changelog.

Here are some examples of conventional PR titles:

- `feat: added a new simulation BouncingBall`
- `fix: correct a bug when...`
- `ci: add GitHub Actions for automated testing`

Generating the changelog based on the commit messages saves time and helps to keep the changelog up-to-date. It also helps to understand the changes in the project.

---

### 7️⃣ Review and Merge

- Wait for the repository owner to review your PR.
- If changes are requested:
  ```bash
  git commit -m "Fix: updated UI based on review"
  git push
  ```
  Once approved the maintainer will merge for you.

---

### 8️⃣ Adding you to contributors

- When the merge is approved and done, you can add you to the contributors section in the README.md
- To know how to do it check the contributors section in the README.md or [here](https://github.com/physicshub/physicshub.github.io/issues/25).

---

## 🏛 Our Pledge

We pledge to maintain an **open, welcoming, and harassment-free** environment for everyone, regardless of:

- Age, body size, disability, ethnicity
- Gender identity/expression
- Level of experience, nationality
- Personal appearance, race, religion
- Sexual identity/orientation

## ✅ Standards of Conduct

### Positive Behaviors

- Use inclusive language
- Respect different viewpoints
- Accept constructive criticism gracefully
- Focus on community benefit
- Show empathy towards others

### Unacceptable Behaviors

- Sexualized language or imagery
- Trolling, insults, or personal/political attacks
- Harassment (public or private)
- Publishing private information without consent
- Any conduct inappropriate in a professional setting

## 📌 Responsibilities

- Maintainers clarify acceptable behavior
- Maintainers may remove or reject contributions that violate the Code of Conduct
- Maintainers may ban contributors for harmful behavior

## 🌍 Scope

This Code of Conduct applies:

- In all project spaces
- In public spaces when representing the project

## 🚨 Enforcement

Report unacceptable behavior or just ask anything here:

- **Discord**: [Join here](https://discord.gg/hT68DTcwfD)
- **Email**: mattqdevv@gmail.com

## 📜 Attribution

Adapted from the [Contributor Covenant](http://contributor-covenant.org/version/1/4/), version 1.4.
