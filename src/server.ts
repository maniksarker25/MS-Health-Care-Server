import { Server } from "http";
import app from "./app";
const port = 5000;

const main = async () => {
  let server: Server;
  server = app.listen(port, () => {
    console.log(`Ms Health Care Server listening on port ${port}`);
  });
};
main();
