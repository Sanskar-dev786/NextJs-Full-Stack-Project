import { IVideo } from "@/models/Video";

export type VideoFormData = Omit<IVideo, "_id">;


type FetchOptions<TBody = unknown> = {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: TBody;
    headers?: Record<string, string>;
};


class ApiClient {
    private async fetch<T>(
        endpoint: string,
        options: FetchOptions = {}
    ): Promise<T> { 
        const { method = "GET", body, headers = {} } = options;

        const defaultHeaders = {
            "Content-Type": "application/json",
            ...headers,
        };

        const response = await fetch(`/api${endpoint}`, {
            method,
            headers: defaultHeaders,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) { 
            throw new Error(await response.text());
        }

        const data: T = await response.json();
        return data;
    }


    async getVideos() {
        return this.fetch("/vidoes");
    }
    async createVideo(videoData:VideoFormData) {
        return this.fetch("/videos", {
            method: "POST",
            body: videoData
        })
    }
}

export const apiClient = new ApiClient();
