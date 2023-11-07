import { RequestHandler } from "socketio-file-router";

export const get: RequestHandler = async (socket, params, args) => {
  console.log("example get", params, args);
};
