import React from "react";

const remote = window.require("electron").remote;
const Dialog = remote.dialog;
const app = remote.app;

const path = window.require("path");
const childProcess = window.require("child_process");

const fs = window.require("fs");
const ffmpeg = window.require("ffmpeg-static");
console.log("path : " + ffmpeg.path);

const ffmpegPath1 = ffmpeg.path
  ? ffmpeg.path.replace("app.asar", "app.asar.unpacked")
  : false;
const ffmpegPath2 = ffmpegPath1.replace(
  "/dist/",
  "/node_modules/ffmpeg-static/"
);
console.log("ffmpeg path : " + ffmpegPath2);

const getNow = () => {
  const dt = new Date();
  const y = dt.getFullYear();
  const m = ("00" + (dt.getMonth() + 1)).slice(-2);
  const d = ("00" + dt.getDate()).slice(-2);
  const hh = ("00" + dt.getHours()).slice(-2);
  const mm = ("00" + dt.getMinutes()).slice(-2);
  const ss = ("00" + dt.getSeconds()).slice(-2);
  const result = y + m + d + hh + mm + ss;
  return result;
};

export default class Top extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      thumbnail: "",
      filename: ""
    };
  }

  chooseFile() {
    const now = getNow();

    Dialog.showOpenDialog(
      null,
      {
        properties: ["openFile"],
        title: "Choose movie",
        defaultPath: ".",
        filters: [{ name: "mp4", extensions: ["mp4"] }]
      },
      fileNames => {
        const targetFilePath = fileNames[0];

        const savePath = path.join(app.getPath("userData"), "sample001");
        if (!fs.existsSync(savePath)) {
          fs.mkdirSync(savePath);
        }
        const savePath2 = path.join(savePath, "thumbnail");
        if (!fs.existsSync(savePath2)) {
          fs.mkdirSync(savePath2);
        }

        const outputFilePath = path.join(savePath2, "thumb-1-" + now + ".png");
        const args = [
          "-ss",
          "0",
          "-i",
          targetFilePath,
          "-vframes",
          "1",
          outputFilePath
        ];

        childProcess.execFile(ffmpegPath2, args, error => {
          if (error) {
            console.log(error);
          }

          this.setState({
            thumbnail: outputFilePath,
            filename: fileNames[0]
          });
        });
      }
    );
  }

  onExec(file) {
    // console.log('onExec : ' + file);
    // console.dir(file);
    const command = "open " + file;

    childProcess.exec(command, (error, stdout) => {
      if (error != null) {
        console.log(error);
      } else {
        console.log(stdout);
      }
    });
  }

  render() {
    return (
      <div className="window">
        <header class="toolbar toolbar-header">
          <h1 class="title">Sample for making screenshot from movie</h1>
          <div>
            <button
              id="fileSelect"
              type="button"
              onClick={() => this.chooseFile()}
            >
              Choose movie
            </button>
            <p>{this.state.filename}</p>
          </div>
        </header>
        <div className="window-content">
          <div className="pane-group">
            <div className="pane">
              <h4>thumbnail</h4>
              <img
                width="80%"
                src={`file://${this.state.thumbnail}`}
                alt={this.state.filename}
                onClick={() => this.onExec(this.state.filename)}
              />
            </div>
            <div className="pane">
              <h4>video tag</h4>
              <video
                width="80%"
                src={`file://${this.state.filename}`}
                onClick={() => this.onExec(this.state.filename)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
