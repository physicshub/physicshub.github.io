// components/Controls.jsx
import PlayPauseButton from "./controls/PlayPauseButton.jsx";
import SpeedControl from "./controls/SpeedControl.jsx";
import ResetButton from "./controls/ResetButton.jsx";
import SaveButton from "./controls/SaveButton.jsx";
import DeleteButton from "./controls/DeleteButton.jsx";
import DownloadButton from "./controls/DownloadButton.jsx";
import UploadButton from "./controls/UploadButton.jsx";

export default function Controls({ onReset, inputs, simulation, onLoad }) {
  simulation = simulation.replaceAll(/[/#]/g, "");

  return (
    <div className="simulation-controls">
      <SaveButton inputs={inputs} simulation={simulation} />
      <DeleteButton simulation={simulation} />
      <SpeedControl />
      <PlayPauseButton />
      <ResetButton onReset={onReset} />
      <DownloadButton inputs={inputs} simulation={simulation} />
      <UploadButton onLoad={onLoad} simulation={simulation} />
    </div>
  );
}
