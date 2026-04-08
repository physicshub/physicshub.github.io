module.exports = {
  defaultNamespace: "common",
  useKeysAsDefaultValue: true,
  functions: ["t"],
  locales: ["en", "es", "ar", "fr", "it", "de"],
  output: "app/(core)/locales/$LOCALE.json",
  input: ["app/**/*.{js,jsx,ts,tsx}", "!app/(core)/locales/**", "!app/api/**"],
  sort: true,
  lexers: {
    js: ["JsxLexer"],
    jsx: ["JsxLexer"],
    ts: ["JavascriptLexer"],
    tsx: ["JsxLexer"],
  },
};
