import { config } from "dotenv";

config();
export const ALLOWED_CLIENTS = [process.env.WEB_APP_URL!];
