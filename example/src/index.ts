import { createServer } from "http";
import { Server } from "socket.io";
import FileRouter from "socketio-file-router";

async function init(): Promise<void> {
  process.on("uncaughtException", (err) => {
    console.log(err);
  });

  const port = 3080;
  const server = createServer();

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  await FileRouter(
    io,
    {
      ROUTES_DIR: "/routes",
      debug: false,
    },
    __dirname
  );

  server.listen(port, () => console.log(`Server listening on port ${port}`));
}
init();
