import express from "express";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { createOrder, createPayment, getCook, getDish, getReviews } from "./store.js";

const spec = parse(readFileSync(new URL("../openapi.yaml", import.meta.url), "utf8"));

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/openapi.json", (_req, res) => {
  res.json(spec);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(spec, {
    customSiteTitle: "Fropti API",
    swaggerOptions: { persistAuthorization: true },
  }),
);

app.get("/", (_req, res) => {
  res.redirect("/api-docs");
});

app.get("/dishes/:id", (req, res) => {
  const result = getDish(req.params.id);
  res.status(result.status).json(result.body);
});

app.get("/dishes/:id/reviews", (req, res) => {
  const page = readPage(req.query.page);
  const size = readSize(req.query.size);
  if (page.error) return res.status(400).json(page.error);
  if (size.error) return res.status(400).json(size.error);
  const result = getReviews(req.params.id, page.value, size.value);
  res.status(result.status).json(result.body);
});

app.get("/cooks/:id", (req, res) => {
  const result = getCook(req.params.id);
  res.status(result.status).json(result.body);
});

app.post("/orders", (req, res) => {
  if (!authorized(req)) return res.status(401).json(unauthorized());
  const dishId = req.body?.dishId;
  const quantity = req.body?.quantity;
  if (typeof dishId !== "string" || dishId.length === 0) {
    return res.status(400).json({ code: "validation_error", message: "dishId обязателен" });
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ code: "validation_error", message: "quantity — целое число от 1" });
  }
  const result = createOrder(dishId, quantity);
  res.status(result.status).json(result.body);
});

app.post("/orders/:id/payments", (req, res) => {
  if (!authorized(req)) return res.status(401).json(unauthorized());
  const result = createPayment(req.params.id);
  res.status(result.status).json(result.body);
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Fropti API: http://localhost:${port}/api-docs`);
});

function authorized(req) {
  const header = req.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" && Boolean(token);
}

function unauthorized() {
  return { code: "unauthorized", message: "Войдите, чтобы заказать блюдо" };
}

function readPage(raw) {
  if (raw === undefined) return { value: 0 };
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    return { error: { code: "validation_error", message: "page — целое число от 0" } };
  }
  return { value };
}

function readSize(raw) {
  if (raw === undefined) return { value: 10 };
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    return { error: { code: "validation_error", message: "size — целое число от 1 до 10" } };
  }
  return { value };
}
