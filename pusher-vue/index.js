var pusher;
var channel;
var user_id;

var app = new Vue({
  el: "#app",
  data() {
    return {
      connectionState: null,
      stage: "subscribe", // subscribe or chat
      //
      username: "Monseur",
      usernamePlaceholder: "Username",
      currentChannel: "", // "Programming", // remove this
      onlineUsersCount: 1,
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
      if (curr.length > 20) this.username = prev;
    },
  },
  beforeMount() {
    // Generate unique user id
    user_id = Math.random().toString(36).substring(2);
    connectToPusher();
    pusher.connection.bind("state_change", (states) => {
      this.connectionState = states.current;
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
      if (this.connectionState !== "disconnected") {
        connectToPusher();
      }
      if (!this.verifyInput()) return;
      // subscribe to the chosen channel
      let channelId = this.channels[this.currentChannel];
      channel = pusher.subscribe(channelId);
      // move to the chats screen
      this.stage = "chat";
      // listen for a message events on the channel
      channel.bind("message-in", (data) => {
        // format and add the message to the list
        data.type = data.user_id == user_id ? "outgoing" : "incoming";
        data.dateTime = new Date(data.timestamp).toLocaleString().split(", ");
        this.messages.push(data);
        // scroll to bottom of .chats-box
        this.$nextTick(() => {
          let chatsBox = document.querySelector(".chats-box");
          chatsBox.scrollTop = chatsBox.scrollHeight;
        });
      });
      channel.bind("pusher:subscription_count", (data) => {
        this.onlineUsersCount = data.subscription_count;
      });
    },
    sendMessage(event) {
      if (event && event.key) {
        if (event.key != "Enter") return;
      }
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
    disconnect() {
      this.stage = "subscribe";
      this.messages = [];
      this.onlineUsersCount = 1;
      pusher.disconnect();
    },
  },
});

function connectToPusher() {
  // Enable pusher logging - don't include this in production
  // Pusher.logToConsole = true;
  // instantiate Pusher
  pusher = new Pusher("d1d37aa9b3e2dd707d91", {
    cluster: "eu",
  });
}
