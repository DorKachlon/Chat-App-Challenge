const express = require("express");

const app = express();
let messages = [];
app.use(express.json());

/* Enter code Below */

app.get("/messages", async (req, res) => {
    res.send(messages);
});
app.post("/messages", async (req, res) => {
    let newMessage = {};
    newMessage.body = req.body.body;
    newMessage.user = req.body.user;
    messages.push(newMessage);
    // messages.push(req.body);
    res.send(messages);
});

/* Enter code Above */

module.exports = app;
