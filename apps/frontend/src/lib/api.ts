import { hc } from "hono/client";
import { type ApiRoutes } from "@backend/index";
import { queryOptions } from "@tanstack/react-query";

const client = hc<ApiRoutes>("/");

export const api = client.api;

export const getAllFilesQueryOptions = queryOptions({
    queryKey: ["files"],
    queryFn: getAllFiles,
});

export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);

    // hono RPC does not work with FormData so just use raw fetch here
    const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Upload failed");
    }

    return response.json();
};

export async function getAllFiles() {
    const res = await api.files.$get();
    if (!res.ok) {
        throw new Error("server error");
    }
    const data = await res.json();
    return data;
}

export const deleteFilesMutation = async (fileIds: string[]) => {
    const res = await api.files.$delete({
        query: { ids: fileIds.join(',') },
    });
    if (!res.ok) {
        throw new Error("Delete failed");
    }
    return res.json();
}