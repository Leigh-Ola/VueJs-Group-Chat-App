const express = require("express");
const Pusher = require("pusher");
const cors = require("cors");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 8080;
const { app_id, key, secret, cluster } = process.env;

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const pusher = new Pusher({
  appId: app_id,
  key,
  secret,
  cluster,
});

// send message data to all clients connected to a channel
function broadcastMessage({ message, sender, timestamp, channel, user_id }) {
  // create "message-in" event for each new message received
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

// receive message data from client
app.post("/message", (req, res) => {
  broadcastMessage(req.body);
  res.send("OK");
});

app.listen(port, () => {
  console.log(`Group chat server started at http://localhost:${port}`);
});
