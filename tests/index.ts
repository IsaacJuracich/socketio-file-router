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
