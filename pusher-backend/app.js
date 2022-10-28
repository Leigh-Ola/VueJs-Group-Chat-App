const express = require("express");
const Pusher = require("pusher");
require("dotenv").config();
// cors
const cors = require("cors");
//
const app = express();
const port = process.env.PORT || 3000;
const { app_id, key, secret, cluster } = process.env;
//
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());

// define a route handler for the default home page
app.get("/", (req, res) => {
  res.send("Hello world!");
});

const pusher = new Pusher({
  appId: app_id,
  key,
  secret,
  cluster,
  useTLS: true,
});

// function to send a message
function broadcastMessage({ message, sender, timestamp, channel, user_id }) {
  pusher
    .trigger(channel, "message-in", {
      message,
      sender,
      user_id,
      timestamp,
    })
    .catch((error) => {
      console.log("Error pushing to client:", error);
    });
}

app.post("/message", (req, res) => {
  console.log("Received message:", req.body);
  broadcastMessage(req.body);
  res.send("OK");
});

{
  let user_id = Math.random().toString(36).substring(3);
  setInterval(() => {
    broadcastMessage({
      message: "hello world",
      sender: "Mona Lisa",
      timestamp: new Date().getTime(),
      channel: "programming",
      user_id,
    });
  }, Math.random() * 10000);
}

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
