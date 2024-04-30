import { Server } from "http";
import app from "./app";
import config from "./app/config";

const main = async () => {
  let server: Server;
  server = app.listen(config.port, () => {
    console.log(`Ms Health Care Server listening on port ${config.port}`);
  });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.info("Server closed");
      });
    }
    process.exit(1);
  };

  process.on("uncaughtException", (error) => {
    console.log(error);
    exitHandler();
  });

  // handle unhandled rejection error
  process.on("unhandledRejection", (error) => {
    console.log(error);
    exitHandler();
  });
};
main();
