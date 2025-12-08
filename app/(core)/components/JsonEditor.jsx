// app/(core)/components/JsonEditor.jsx
"use client";
import React from 'react';
import AceEditor from 'react-ace';

// Importa le modalità e i temi necessari da ace-builds
import 'ace-builds/src-noconflict/mode-json'; 
import 'ace-builds/src-noconflict/theme-cobalt'; 
import 'ace-builds/src-noconflict/ext-language_tools'; 

const JsonEditor = ({ value, onChange }) => {
    const theme = 'cobalt'; 

    return (
        <AceEditor
            mode="json" // Modalità di evidenziazione per JSON
            theme={theme}
            value={value}
            onChange={onChange}
            name="json_editor"
            editorProps={{ $blockScrolling: true }}
            setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                showLineNumbers: true, // 🌟 Numerazione delle righe
                tabSize: 2,
                useWorker: false // Disabilita i worker per evitare problemi di Next.js/SSR
            }}
            style={{
                width: '100%',
                minHeight: '400px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
            }}
        />
    );
};

export default JsonEditor;