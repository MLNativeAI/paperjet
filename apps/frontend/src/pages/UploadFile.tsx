"use client";

import { File, Loader2 } from "lucide-react";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
// import { type ApiRoutes } from "../../../backend";
// import { hc } from "hono/client";
import { useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFile } from "@/lib/api";

// const client = hc<ApiRoutes>("/");

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const validFileTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/pdf",
  ];

  const mutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("File uploaded successfully!", {
        position: "bottom-right",
        duration: 3000,
      });
      resetFile();
      router.navigate({ to: "/" });
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error("Failed to upload file. Please try again.", {
        position: "bottom-right",
        duration: 3000,
      });
    },
  });

  const handleFile = (file: File | undefined) => {
    if (!file) return;

    if (validFileTypes.includes(file.type)) {
      setFile(file);
    } else {
      toast.error("Please upload a CSV, XLSX, XLS, or PDF file.", {
        position: "bottom-right",
        duration: 3000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    mutation.mutate(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const resetFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center justify-center p-10 w-full max-w-lg">
      <form className="w-full" onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold text-foreground">File Upload</h3>

        <div
          className="flex justify-center rounded-md border mt-2 border-dashed border-input px-6 py-12"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div>
            <File
              className="mx-auto h-12 w-12 text-muted-foreground"
              aria-hidden={true}
            />
            <div className="flex text-sm leading-6 text-muted-foreground">
              <p>Drag and drop or</p>
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-sm pl-1 font-medium text-primary hover:underline hover:underline-offset-4"
              >
                <span>choose file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".csv,.xlsx,.xls,.pdf"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>
              <p className="pl-1">to upload</p>
            </div>
            {file && (
              <p className="mt-2 text-sm text-muted-foreground">
                Selected file: {file.name}
              </p>
            )}
          </div>
        </div>

        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Accepted file types: CSV, XLSX, XLS, or PDF files.
        </p>

        <div className="mt-8 flex items-center justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={resetFile}
            disabled={!file}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!file || mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
