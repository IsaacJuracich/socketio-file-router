import { RequestHandler } from "../../../dist/cjs/index";

export const get: RequestHandler = async (socket, params, args) => {
  console.log("example get", params, args);
};
