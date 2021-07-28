import React, { useState, useEffect } from "react";
import { v1 as uuid } from "uuid";
import { Button, Grid, Box, TextField } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { CookiesProvider, Cookies, useCookies } from "react-cookie";
import axios from "axios";

const CreateRoom = (props) => {
  function create() {
    const id = uuid();
    props.history.push(`/room/${id}?name=${docName}`);
  }

  function open(doc) {
    props.history.push(`/room/${doc.id}?name=${doc.name}`);
  }

  const cookies = new Cookies();
  const userCookie = cookies.get("userCookie");

  const [docs, setDocs] = useState([]);
  const [docName, setDocname] = useState();

  const backendAPI = process.env.REACT_APP_SERVER_URL;

  useEffect(() => {
    axios
      .get(`${backendAPI}/user_doc/getdoc?GID=${userCookie.GID}`)
      .then((res) => {
        console.log(res.data);
        setDocs(res.data);
      });
  }, []);

  console.log("Doc List : ", docs);

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.text.secondary,
      height: "100%",
      width: "100%",
    },
  }));

  const classes = useStyles();

  return (
    <div style={{ backgroundColor: "LightBlue" }}>
      <Grid
        container
        style={{
          backgroundColor: "LightBlue",
          height: "100vh",
          padding: "2%",
          width: "100%",
          overflowY: "scroll",
        }}
      >
        <Grid
          item
          xs={12}
          style={{
            minWidth: 100 + "%",
            display: "flex",
            justifyContent: "center",
            alignItems: "start",
          }}
        >
          <Box style={{ textAlign: "center" }}>
            <h1
              style={{
                fontFamily: "Julius Sans One",
                fontSize: 50 + "px",
                color: "black",
              }}
            >
              Prodigy
              <p
                style={{
                  fontFamily: "Julius Sans One",
                  fontSize: 13 + "px",
                  color: "black",
                }}
              >
                <strong>A place to collaborate</strong>
              </p>
            </h1>
            <Grid item xs={12} style={{ marginBottom: "7%" }}>
              <Paper className={classes.paper}>
                <TextField
                  required
                  fullWidth
                  label="Doc Name"
                  onChange={(event) => setDocname(event.target.value)}
                />
                <Button
                  size="large"
                  className="room-button"
                  variant="contained"
                  color="primary"
                  onClick={create}
                  style={{ marginTop: "3%" }}
                >
                  Create New Doc
                </Button>
              </Paper>
            </Grid>
          </Box>
        </Grid>

        {docs.map((doc, i) => {
          return (
            <Grid key={i} item xs={3}>
              <Button
                key={i}
                onClick={() => open(doc)}
                style={{ height: "100%", width: "100%" }}
              >
                <Paper className={classes.paper}>
                  <h1>
                    {doc.name}
                    <p
                      style={{
                        fontFamily: "Julius Sans One",
                        fontSize: 13 + "px",
                        color: "black",
                      }}
                    >
                      <strong>{doc.id}</strong>
                    </p>
                  </h1>
                </Paper>
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

export default CreateRoom;
