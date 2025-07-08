"use client";

import { upload, UploadResponse } from "@imagekit/next";
import { useState } from "react";

interface FileUploadProps {
    onSuccess: (res: UploadResponse) => void;
    onProgress?: (progress: number) => void;
    fileType?: "image" | "video";
}

const FileUpload = ({ onSuccess, onProgress, fileType }: FileUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateFile = (file: File) => {
        if (fileType === "video" && !file.type.startsWith("video/")) {
            setError("Please upload a valid video file.");
            return false;
        }
        if (fileType === "image" && !file.type.startsWith("image/")) {
            setError("Please upload a valid image file.");
            return false;
        }
        if (file.size > 100 * 1024 * 1024) {
            setError("File size must be less than 100 MB.");
            return false;
        }
        return true;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file || !validateFile(file)) return;

        setUploading(true);
        setError(null);

        try {
            const authRes = await fetch("/api/auth/imagekit-auth");
            const auth = await authRes.json();

            const res = await upload({
                expire: auth.expire,
                token: auth.token,
                signature: auth.signature,
                publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
                file,
                fileName: file.name,
                onProgress: (event) => {
                    if (event.lengthComputable && onProgress) {
                        const percent = (event.loaded / event.total) * 100;
                        onProgress(Math.round(percent));
                    }
                },
            });

            onSuccess(res);
        } catch (error) {
            console.error("Upload failed", error);
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <input
                type="file"
                accept={fileType === "video" ? "video/*" : "image/*"}
                onChange={handleFileChange}
            />
            {uploading && <span>Loading...</span>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </>
    );
};

export default FileUpload;
