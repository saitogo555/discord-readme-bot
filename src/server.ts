import { Hono } from "hono";

const app = new Hono();

// ヘルスチェック用のエンドポイント
app.get("/", (c) => {
	return c.json({
		status: "ok",
		name: "Discord Readme Bot",
		node_version: process.version,
		platform: process.platform,
		memory_usage: process.memoryUsage(),
		timestamp: new Date().toISOString(),
	});
});

export default app;
