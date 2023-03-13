const express = require("express");
const Pusher = require("pusher");
const cors = require("cors");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const { app_id, key, secret, cluster } = process.env;
//
app.use(express.json());
app.use(cors());

// define a route handler for the default home page
app.use(express.static("../pusher-vue"));

app.get("/test", (req, res) => {
  res.send("Running Pusher group chat app server");
});

// Setup Pusher
const pusher = new Pusher({
  appId: app_id,
  key,
  secret,
  cluster,
});

// send message data to all clients connected to a channel
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

// receive message data from client
app.post("/message", (req, res) => {
  console.log("Received message:", req.body);
  broadcastMessage(req.body);
  res.send("OK");
});

// {
//   let msgs = [
//     "Hello World",
//     `Hi James.
//     Nice to Meet you.
//     Hope all is well.`,
//     "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea optio enim saepe itaque eos earum, ipsa suscipit veritatis eligendi a, vitae possimus consectetur rem quaerat nostrum quis quidem. Nesciunt, saepe.",
//   ];
//   let user_id = Math.random().toString(36).substring(3);
//   function send(i) {
//     let intv = i >= msgs.length ? 20000 : 3000;
//     i = i >= msgs.length ? 0 : i;
//     setTimeout(() => {
//       broadcastMessage({
//         message: msgs[i],
//         sender: "Mona Lisa",
//         timestamp: new Date().getTime(),
//         channel: "programming",
//         user_id,
//       });
//       console.log("Sent message", new Date().toLocaleString());
//       send(++i);
//     }, intv);
//   }
//   send(0);
// }

// start the Express server

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
