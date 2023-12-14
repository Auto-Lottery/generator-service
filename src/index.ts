import express, { Request, Response } from "express";
import V1Routes from "./api/v1/routes/routes";
import { connectDb } from "./api/v1/config/mongodb";
import { PORT } from "./api/v1/config";
import { connectRedis } from "./api/v1/config/redis";
import { connectQueue } from "./api/v1/config/rabbitmq";
import { GeneratorService } from "./api/v1/services/generator.service";

const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);

app.get("/", function (req: Request, res: Response) {
  res.send("Generator service!");
});

app.use("/v1", V1Routes);

app.listen(PORT, async () => {
  console.log(`Started server on ${PORT} port`);
  await connectDb();
  await connectRedis();
  await connectQueue();

  const generatorService = new GeneratorService();
  generatorService.generatorQueue();
});
