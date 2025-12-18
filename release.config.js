export const branches = ["main"];
export const plugins = [
  "@semantic-release/commit-analyzer", // read commit messages
  "@semantic-release/release-notes-generator", // generate release notes
  "@semantic-release/changelog", // update CHANGELOG.md
  ["@semantic-release/npm", { npmPublish: false }], // update version in package.json without publishing to npm
  "@semantic-release/github"[ // create GitHub release
    ("@semantic-release/exec",
    {
      // Questo comando scrive nel file speciale di GitHub Actions solo se la release ha successo
      successCmd: "echo 'new_release_published=true' >> $GITHUB_OUTPUT",
    })
  ],
];
