// app/(core)/components/JsonEditor.jsx
"use client";
import React, { useRef, useEffect, useState } from 'react'; 
import AceEditor from 'react-ace';

// IMPORTAZIONE CORRETTA DEL COMPONENTE SELECTINPUT
import SelectInput from './inputs/SelectInput.jsx'; 

// --- Importazioni Temi Ace Editor ---
import 'ace-builds/css/ace.css';

// Temi Scuri
import 'ace-builds/css/theme/monokai.css'; 
import 'ace-builds/src-noconflict/theme-monokai'; 
import 'ace-builds/css/theme/tomorrow_night.css'; 
import 'ace-builds/src-noconflict/theme-tomorrow_night'; 
import 'ace-builds/css/theme/cobalt.css'; 
import 'ace-builds/src-noconflict/theme-cobalt'; 
import 'ace-builds/css/theme/twilight.css'; 
import 'ace-builds/src-noconflict/theme-twilight'; 
import 'ace-builds/css/theme/dracula.css'; 
import 'ace-builds/src-noconflict/theme-dracula'; 
import 'ace-builds/css/theme/terminal.css'; 
import 'ace-builds/src-noconflict/theme-terminal'; 
import 'ace-builds/css/theme/vibrant_ink.css';
import 'ace-builds/src-noconflict/theme-vibrant_ink';
import 'ace-builds/css/theme/merbivore.css';
import 'ace-builds/src-noconflict/theme-merbivore';
import 'ace-builds/css/theme/idle_fingers.css';
import 'ace-builds/src-noconflict/theme-idle_fingers';
import 'ace-builds/css/theme/kr_theme.css';
import 'ace-builds/src-noconflict/theme-kr_theme';
import 'ace-builds/css/theme/nord_dark.css';
import 'ace-builds/src-noconflict/theme-nord_dark';


// Temi Chiari
import 'ace-builds/css/theme/chrome.css'; 
import 'ace-builds/src-noconflict/theme-chrome'; 
import 'ace-builds/css/theme/github.css'; 
import 'ace-builds/src-noconflict/theme-github'; 
import 'ace-builds/css/theme/xcode.css';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/css/theme/clouds.css';
import 'ace-builds/src-noconflict/theme-clouds';
import 'ace-builds/css/theme/textmate.css';
import 'ace-builds/src-noconflict/theme-textmate';
import 'ace-builds/css/theme/solarized_light.css';
import 'ace-builds/src-noconflict/theme-solarized_light';
import 'ace-builds/css/theme/kuroir.css';
import 'ace-builds/src-noconflict/theme-kuroir';


// Importazione della modalità e degli strumenti
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/ext-language_tools';


const THEME_OPTIONS = [
    { value: 'cobalt', label: 'Cobalt (Dark)' },
    { value: 'monokai', label: 'Monokai (Dark)' },
    { value: 'tomorrow_night', label: 'Tomorrow Night (Dark)' },
    { value: 'twilight', label: 'Twilight (Dark)' },
    { value: 'dracula', label: 'Dracula (Dark)' },
    { value: 'vibrant_ink', label: 'Vibrant Ink (Dark)' },
    { value: 'terminal', label: 'Terminal (Dark)' },
    { value: 'merbivore', label: 'Merbivore (Dark)' },
    { value: 'idle_fingers', label: 'Idle Fingers (Dark)' },
    { value: 'kr_theme', label: 'KR Theme (Dark)' },
    { value: 'nord_dark', label: 'Nord Dark (Dark)' },
    { value: 'chrome', label: 'Chrome (Light)' },
    { value: 'github', label: 'GitHub (Light)' },
    { value: 'xcode', label: 'Xcode (Light)' },
    { value: 'clouds', label: 'Clouds (Light)' },
    { value: 'textmate', label: 'TextMate (Light)' },
    { value: 'solarized_light', label: 'Solarized Light (Light)' },
    { value: 'kuroir', label: 'Kuroir (Light)' },
];


const JsonEditor = ({ value, onChange }) => {
    const [selectedTheme, setSelectedTheme] = useState('cobalt');
    
    const editorRef = useRef(null); 

    const handleThemeChange = (e) => {
        setSelectedTheme(e.target.value);
    };

    useEffect(() => {
        const editorElement = editorRef.current;
        if (!editorElement) return;

        const disableBodyScroll = () => {
            document.body.style.overflow = 'hidden';
        };

        const enableBodyScroll = () => {
            document.body.style.overflow = '';
        };

        editorElement.addEventListener('mouseenter', disableBodyScroll);
        editorElement.addEventListener('mouseleave', enableBodyScroll);

        return () => {
            editorElement.removeEventListener('mouseenter', disableBodyScroll);
            editorElement.removeEventListener('mouseleave', enableBodyScroll);
        };
    }, []);

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
                ref={editorRef}
                style={{ 
                    width: '100%', 
                    height: '600px', 
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--gray-300, #ccc)',
                    touchAction: 'none', 
                    marginTop: '1.5rem'
                }}
            >
                <AceEditor
                    mode="json"
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
                        width: '100%',
                        height: '100%',
                    }}
                    showPrintMargin={false}
                />
            </div>
        </div>
    );
};

export default JsonEditor;