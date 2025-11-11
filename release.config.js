export const branches = ["main"];
export const plugins = [
  "@semantic-release/commit-analyzer", // read commit messages
  "@semantic-release/release-notes-generator", // generate release notes
  "@semantic-release/changelog", // update CHANGELOG.md
  ["@semantic-release/npm", { npmPublish: false }], // update version in package.json without publishing to npm
  "@semantic-release/github" // create GitHub release
];
