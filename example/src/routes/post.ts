import { RequestHandler } from "../../../dist/cjs/index";

export const post: RequestHandler = async (socket, params, args) => {
  console.log("example post", params, args);
};
