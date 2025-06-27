import { FileService } from "@paperjet/engine";
import { Hono } from "hono";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { s3 } from "@/lib/s3";

const app = new Hono();

// Initialize file service with dependencies
const fileService = new FileService({ s3 });

const router = app
    .get("/", async (c) => {
        try {
            const user = await getUser(c);
            const files = await fileService.getFiles(user.id);
            return c.json(files);
        } catch (error) {
            console.error("Get files error:", error);
            return c.json({ error: "Failed to get files" }, 500);
        }
    })
    .post("/", async (c) => {
        try {
            const user = await getUser(c);
            const body = await c.req.formData();
            const fileParam = body.get("file") as File;
            const nameParam = body.get("name") as string;

            const result = await fileService.uploadFile(user.id, fileParam, nameParam);
            return c.json(
                {
                    message: "File uploaded successfully",
                    ...result,
                },
                201,
            );
        } catch (error) {
            console.error("Upload error:", error);
            if (error instanceof z.ZodError) {
                return c.json({ error: "Invalid file data" }, 400);
            }
            if (error instanceof Error && error.message === "File and name are required") {
                return c.json({ error: "File and name are required" }, 400);
            }
            return c.json({ error: "Internal server error" }, 500);
        }
    })
    .delete("/", async (c) => {
        try {
            const fileIds = c.req.query("ids")?.split(",");

            if (!fileIds || fileIds.length === 0) {
                return c.json({ error: "File IDs are required" }, 400);
            }

            await fileService.deleteFiles(fileIds);
            return c.json({ message: "Files deleted successfully" }, 200);
        } catch (error) {
            console.error("Delete error:", error);
            if (error instanceof Error && error.message === "File IDs are required") {
                return c.json({ error: "File IDs are required" }, 400);
            }
            return c.json({ error: "Internal server error" }, 500);
        }
    });

export default router;

export type FileRouteType = typeof router;
