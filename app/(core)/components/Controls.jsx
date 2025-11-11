// components/Controls.jsx
import PlayPauseButton from "./controls/PlayPauseButton.jsx";
import SpeedControl from "./controls/SpeedControl.jsx";
import ResetButton from "./controls/ResetButton.jsx";
import SaveButton from "./controls/SaveButton.jsx";
import DeleteButton from "./controls/DeleteButton.jsx";
import DownloadButton from "./controls/DownloadButton.jsx";
import UploadButton from "./controls/UploadButton.jsx";
import ShareLinkControl from "./controls/ShareLinkControl.jsx";
import EmbedCodeControl from "./controls/EmbedCodeControl.jsx";

export default function Controls({ onReset, inputs, simulation, onLoad }) {
  simulation = simulation.replaceAll(/[/#]/g, "");

  return (
    <div className="simulation-controls">
      <div className="control-item">
        <SaveButton inputs={inputs} simulation={simulation} />
        <DeleteButton simulation={simulation} />
      </div>

      <div className="control-item">
        <SpeedControl />
        <PlayPauseButton />
        <ResetButton onReset={onReset} />
      </div>

      <div className="control-item">
        <DownloadButton inputs={inputs} simulation={simulation} />
        <UploadButton onLoad={onLoad} simulation={simulation} />
      </div>
      <div className="control-item">
        <ShareLinkControl inputs={inputs} simulation={simulation} />
        <EmbedCodeControl inputs={inputs} simulation={simulation} />
      </div>
    </div>
  );
}
