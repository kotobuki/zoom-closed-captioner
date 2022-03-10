/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */
import fetch from "node-fetch";

import path from "path";

import Fastify from "fastify";
const fastify = Fastify({
  logger: true,
});

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fastifyStatic from "fastify-static";
fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});

import fastifyFormbody from "fastify-formbody";
fastify.register(fastifyFormbody);

import pointOfView from "point-of-view";

import handleBars from "handlebars";

fastify.register(pointOfView, {
  engine: {
    handlebars: handleBars,
  },
});

fastify.get("/", function (request, reply) {
  let params = {};

  reply.view("/src/pages/index.hbs", params);
});

/**
 * Our POST route to handle and react to form submissions
 *
 * Accepts body data indicating the user choice
 */
fastify.post("/", function (request, reply) {
  let params = {};

  reply.view("/src/pages/index.hbs", params);
});

fastify.post("/caption", function (request, reply) {
  const apiToken = request.body.apiToken;
  const caption = request.body.captionText;

  if (apiToken && caption) {
    const urlToGetCounter = apiToken.replace(
      "/closedcaption",
      "/closedcaption/seq"
    );

    let counter;
    fetch(urlToGetCounter, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(typeof data);
        counter = data;
        console.log("counter", counter);
        const urlToSubmitCaption = `${apiToken}&seq=${counter + 1}&lang=jp-JP`;
        const text = caption;
        console.log("text", text);
        fetch(urlToSubmitCaption, {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "text/plain" },
          credentials: "include",
          body: text,
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            counter = data;
          });
      });
  }
});

// Run the server and report out to the logs
fastify.listen(process.env.PORT, "0.0.0.0", function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
