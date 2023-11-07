import { RequestHandler } from "socketio-file-router";

export const post: RequestHandler = async (socket, params, args) => {
  console.log("example post", params, args);
};
