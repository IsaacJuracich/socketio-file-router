const { io } = require("socket.io-client");
const { expect } = require("chai");

const socket = io("http://localhost:3080", {
  transports: ["websocket"],
  upgrade: false,
});

describe("File Router", () => {
  it("Socket Connect", (done) => {
    socket.on("connect", () => {
      done();
    });
  });

  it("Socket Emit", (done) => {
    socket.emit("/post", { message: "Hello World" });

    socket.emit("/get", { message: "Hello World" });

    socket.emit("/dynamic/param/testing", { message: "Hello World" });

    socket.emit("/dynamic/slug/lydia/is/the/goat", { message: "Hello World" });

    socket.emit("/user", {
      userID: "1234",
    });
    done();
  });

  it("Socket Disconnect", (done) => {
    socket.on("disconnect", () => {
      done();
    });

    socket.disconnect();
  });
});
