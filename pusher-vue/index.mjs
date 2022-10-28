import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

var pusher;
var channel;
var user_id;

createApp({
  data() {
    return {
      stage: "subscribe", // subscribe or chat
      //
      username: "Monseur",
      usernamePlaceholder: "Username",
      currentChannel: "", // "Programming", // remove this
      //
      message: "",
      selectedMessageTimestamp: null,
      messages: [],
      channels: {
        Programming: "programming",
        "Tech News": "tech-news-channel",
        "Dad Jokes": "dad-jokes-channel",
      },
    };
  },
  watch: {
    username(curr, prev) {
      if (curr.length > 10) this.username = prev;
    },
  },
  beforeMount() {
    // Generate unique user id
    user_id = Math.random().toString(36).substring(2);
    // instantiate Pusher
    pusher = new Pusher("d1d37aa9b3e2dd707d91", {
      cluster: "eu",
    });
  },
  mounted() {
    this.openChannel();
  },
  methods: {
    verifyInput() {
      if (!this.username) {
        this.usernamePlaceholder = "Please enter a username";
        return false;
      }
      if (!this.currentChannel) return false;
      return true;
    },
    openChannel() {
      if (!this.verifyInput()) return;
      // subscribe to the chosen channel
      let channelId = this.channels[this.currentChannel];
      channel = pusher.subscribe(channelId);
      // move to the chats screen
      this.stage = "chat";
      // listen for a message events on the channel
      let app = this;
      channel.bind("message-in", function (data) {
        // console.log(data);
        data.type = data.user_id == user_id ? "outgoing" : "incoming";
        data.dateTime = new Date(data.timestamp).toLocaleString().split(", ");
        app.messages.push(data);
      });
      channel.bind("pusher:subscription_count", (data) => {
        console.log(data.subscription_count);
        console.log(channel.subscription_count);
      });
    },
    sendMessage() {
      if (!this.message) return;
      let channelId = this.channels[this.currentChannel];
      // send a fetch post request
      let data = {
        message: this.message,
        sender: this.username,
        timestamp: new Date().getTime(),
        channel: channelId,
        user_id,
      };
      console.log("Sending message:", data);
      let baseurl = "http://localhost:3000";
      fetch(baseurl + "/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((res) => {
          console.log("Message sent", res);
          this.message = "";
        })
        .catch((e) => {
          console.log("Error sending message", e);
        });
    },
  },
}).mount("#app");
