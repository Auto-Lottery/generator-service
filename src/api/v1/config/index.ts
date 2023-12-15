import { config } from "dotenv";
config();

const VAULT_URL = process.env.VAULT_URL || "";
const VAULT_TOKEN = process.env.VAULT_TOKEN || "";
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "";
const PORT = Number(process.env.PORT || "5002");

export { VAULT_URL, VAULT_TOKEN, PORT, AUTH_SERVICE_URL };
