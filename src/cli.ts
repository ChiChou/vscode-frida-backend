#!/usr/bin/env node
import { start } from "./server";

start(process.env.SOCKET_PATH, () => process.stdout.write('%SERVER_READY%'));