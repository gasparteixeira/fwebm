import React from "react";
import PropTypes from "prop-types";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { withStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import ListSubheader from "@material-ui/core/ListSubheader";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import _ from "lodash";

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2)
  },
  button: {
    margin: theme.spacing(1)
  },
  input: {
    display: "none"
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper
  },
  formControl: {
    marginRight: 30
  },
  gridList: {
    width: "100%",
    height: "auto"
  },
  gridTitle: {
    height: 28
  },
  icon: {
    color: "rgba(255, 255, 255, 0.54)"
  }
});

const remote = window.require("electron").remote;
const dialog = remote.dialog;
const path = window.require("path");
var spawn = require("child_process").spawn;

const fs = window.require("fs");
const util = window.require("util");
const readdir = util.promisify(fs.readdir);
const ffmpeg = window.require("ffmpeg-static");

const ffmpegPath1 = ffmpeg.path
  ? ffmpeg.path.replace("app.asar", "app.asar.unpacked")
  : false;
const ffmpegPath2 = ffmpegPath1.replace(
  "/dist/",
  "/node_modules/ffmpeg-static/"
);

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

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      digitsQuantity: 0,
      imageName: "",
      imageStart: 0,
      folderPath: "",
      imageExtension: "png",
      framerate: 30,
      quality: "2M",
      files: [],
      video: "",
      completed: 0,
      open: false,
      success: false,
      message: ""
    };
    this.timer = null;
  }

  chooseFile() {
    clearTimeout(this.timer);
    dialog.showOpenDialog(
      null,
      {
        properties: ["openDirectory"],
        title: "Select images",
        filters: [{ name: "Images", extensions: ["png"] }]
      },
      async folderPaths => {
        if (typeof folderPaths !== "undefined") {
          let files = [];
          let imageName = "";
          let imageStart = 0;
          let digitsQuantity = 0;
          try {
            const images = await readdir(folderPaths[0]);
            images.forEach(image => {
              if (image.endsWith(`.${this.state.imageExtension}`)) {
                var fullFilePath = `${folderPaths[0]}/${image}`;

                if (imageName === "") {
                  var name = path.parse(fullFilePath).name;
                  var matches = name.match(/\d+$/);
                  var baseName = name.replace(matches[0], "");
                  imageName = baseName;
                  imageStart = matches[0];
                  digitsQuantity = _.size(matches[0]);
                }
                files.push({
                  path: fullFilePath,
                  name: image
                });
              }
            });
          } catch (err) {
            console.error("Error occured while reading directory!", err);
          }
          this.setState({
            folderPath: folderPaths[0],
            files: files,
            imageName,
            imageStart,
            digitsQuantity
          });
        }
      }
    );
  }

  onExec = () => {
    const {
      imageStart,
      folderPath,
      imageExtension,
      framerate,
      quality
    } = this.state;
    const now = getNow();
    let videoPath = `${folderPath}/${now}_${framerate}fps_${quality}.webm`;

    var args = [
      "-framerate",
      framerate,
      "-start_number",
      imageStart,
      "-pattern_type",
      "glob",
      "-i",
      `${folderPath}/*.${imageExtension}`,
      "-progress",
      "pipe:1",
      "-c:v",
      "libvpx",
      "-pix_fmt",
      "yuva420p",
      "-metadata:s:v:0",
      "alpha_mode=1",
      "-auto-alt-ref",
      "0",
      "-b:v",
      quality,
      videoPath
    ];
    var proc = spawn(ffmpegPath2, args);
    proc.stderr.setEncoding("utf8");
    proc.stdout.setEncoding("utf8");
    proc.stdout.on("data", data => {
      var str = data.toString(),
        lines = str.split(/(\r?\n)/g);
      var num = lines[0].replace(/\D/g, "");
      var total = (num * 100) / _.size(this.state.files);
      this.setState({ completed: parseInt(total) });
    });

    proc.stderr.on("data", data => {});

    proc.on("close", () => {
      this.setState({ video: videoPath, files: [], completed: 0 });
    });

    proc.on("exit", exitCode => {
      if (parseInt(exitCode) !== 0) {
        var message = `Code: ${exitCode} - something wrong. `;
        this.setState({
          completed: 100,
          success: false,
          message: message
        });

        this.timer = setTimeout(() => {
          this.setState({ completed: 0, open: true });
          clearTimeout(this.timer);
        }, 1000);
      }
    });
  };

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <CssBaseline />
        {this.state.completed > 0 && (
          <div
            style={{
              display: "flex",
              position: "absolute",
              height: "100vh",
              width: "100vw",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9997
            }}
          >
            <span
              style={{
                position: "absolute",
                height: "100vh",
                width: "100vw",
                backgroundColor: "rgba(0,0,0,.4)",
                zIndex: 1
              }}
            />
            <span
              style={{
                fontSize: 14,
                color: "white",
                marginLeft: 10,
                textAlign: "center",
                position: "absolute",
                width: "100vw",
                zIndex: 2
              }}
            >
              <CircularProgress
                className={classes.progress}
                color="secondary"
              />
              <p>{this.state.completed}%</p>
            </span>
          </div>
        )}
        <Container maxWidth={false}>
          <Typography variant="subtitle1" gutterBottom>
            Generate Webm videos from images (.png)
          </Typography>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => this.chooseFile()}
          >
            Open folder
          </Button>
          <Divider />

          {_.size(this.state.files) > 0 && (
            <>
              <div className={classes.root}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Paper className={classes.paper}>
                      <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="framerate-simple">
                          Framerate
                        </InputLabel>
                        <Select
                          value={this.state.framerate}
                          onChange={this.handleChange}
                          inputProps={{
                            name: "framerate",
                            id: "framerate-simple"
                          }}
                        >
                          <MenuItem value={16}>16</MenuItem>
                          <MenuItem value={20}>20</MenuItem>
                          <MenuItem value={24}>24</MenuItem>
                          <MenuItem value={30}>30</MenuItem>
                          <MenuItem value={36}>36</MenuItem>
                          <MenuItem value={44}>44</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="quality-simple">
                          Quality
                        </InputLabel>
                        <Select
                          value={this.state.quality}
                          onChange={this.handleChange}
                          inputProps={{
                            name: "quality",
                            id: "quality-simple"
                          }}
                        >
                          <MenuItem value="2M">2M</MenuItem>
                          <MenuItem value="4M">4M</MenuItem>
                          <MenuItem value="8M">8M</MenuItem>
                          <MenuItem value="16M">16M</MenuItem>
                          <MenuItem value="24M">24M</MenuItem>
                          <MenuItem value="32M">32M</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        onClick={this.onExec}
                        variant="contained"
                        color="secondary"
                        className={classes.button}
                      >
                        Execute
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
              </div>
              <div className={classes.grid}>
                <GridList
                  cellHeight={180}
                  cols={4}
                  className={classes.gridList}
                >
                  <GridListTile
                    key="Subheader"
                    cols={4}
                    style={{ height: "auto" }}
                  >
                    <ListSubheader component="div">
                      Path: <strong>{this.state.folderPath}</strong>, Total:{" "}
                      <strong>{_.size(this.state.files)}</strong>{" "}
                    </ListSubheader>
                  </GridListTile>
                  {this.state.files.map(file => (
                    <GridListTile key={file.name}>
                      <img src={`file://${file.path}`} alt={file.name} />
                      <GridListTileBar
                        className={classes.gridTitle}
                        subtitle={file.name.slice(-7)}
                      />
                    </GridListTile>
                  ))}
                </GridList>
              </div>
            </>
          )}
          {this.state.video !== "" && (
            <Grid
              container
              spacing={0}
              direction="column"
              alignItems="center"
              justify="center"
              style={{ minHeight: "50vh" }}
            >
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  style={{ marginBottom: 15, marginTop: 15 }}
                >
                  Path: <strong>{this.state.video}</strong>
                </Typography>
                <video controls muted autoPlay style={{ outline: "none" }}>
                  <source
                    src={`file://${this.state.video}`}
                    type="video/webm"
                  />
                </video>
              </Grid>
            </Grid>
          )}
        </Container>
        <Dialog
          onClose={this.handleClose}
          aria-labelledby="simple-dialog-title"
          open={this.state.open}
        >
          <DialogContent>
            <Typography gutterBottom style={{ fontWeight: "bold" }}>
              Status
            </Typography>
            <Typography gutterBottom>{this.state.message}</Typography>
          </DialogContent>
        </Dialog>
      </React.Fragment>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Home);
