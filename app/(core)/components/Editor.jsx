// app/(core)/components/Editor.jsx
"use client";
import React, { useState, useEffect } from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/ext-language_tools";

import "ace-builds/src-noconflict/theme-cobalt";

import SelectInput from "./inputs/SelectInput.jsx";

const THEME_OPTIONS = [
  { value: "cobalt", label: "Cobalt (Dark)" },
  { value: "monokai", label: "Monokai (Dark)" },
  { value: "tomorrow_night", label: "Tomorrow Night (Dark)" },
  { value: "twilight", label: "Twilight (Dark)" },
  { value: "dracula", label: "Dracula (Dark)" },
  { value: "vibrant_ink", label: "Vibrant Ink (Dark)" },
  { value: "terminal", label: "Terminal (Dark)" },
  { value: "merbivore", label: "Merbivore (Dark)" },
  { value: "idle_fingers", label: "Idle Fingers (Dark)" },
  { value: "kr_theme", label: "KR Theme (Dark)" },
  { value: "nord_dark", label: "Nord Dark (Dark)" },
  { value: "chrome", label: "Chrome (Light)" },
  { value: "github", label: "GitHub (Light)" },
  { value: "xcode", label: "Xcode (Light)" },
  { value: "clouds", label: "Clouds (Light)" },
  { value: "textmate", label: "TextMate (Light)" },
  { value: "solarized_light", label: "Solarized Light (Light)" },
  { value: "kuroir", label: "Kuroir (Light)" },
];

const Editor = ({ value, onChange }) => {
  const [selectedTheme, setSelectedTheme] = useState("cobalt");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (e) => {
    const theme = e.target.value;
    import(`ace-builds/src-noconflict/theme-${theme}`).then(() => {
      setSelectedTheme(theme);
    });
  };

  if (!mounted) return <div style={{ height: "600px" }}>Loading Editor...</div>;

  return (
    <div>
      <SelectInput
        label="Select Theme:"
        name="theme-selector"
        options={THEME_OPTIONS}
        value={selectedTheme}
        onChange={handleThemeChange}
        placeholder="Select a theme"
      />

      <div
        className="editor-container"
        style={{
          width: "100%",
          height: "600px",
          borderRadius: "var(--border-radius)",
          border: "1px solid var(--gray-300, #ccc)",
          marginTop: "1.5rem",
          overflow: "hidden", // Gestisce lo scroll senza JS complicato
        }}
      >
        <AceEditor
          mode="javascript"
          theme={selectedTheme}
          value={value}
          onChange={onChange}
          name="json_editor"
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            showLineNumbers: true,
            tabSize: 2,
            useWorker: false,
            showPrintMargin: false,
            autoScrollEditorIntoView: false,
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );
};

export default Editor;
