import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import toast from "react-hot-toast";
import { BASE_URL } from "../../constants";

// Initial state
const initialState = {
    loading: false,
    uploading: false,
    uploaded: false,
    videos: {
        docs: [],
        hasNextPage: false,
    },
    video: null,
    publishToggled: false,
};

// Thunks
export const getAllVideos = createAsyncThunk(
    "video/getAllVideos",
    async ({ userId, sortBy, sortType, query, page = 1, limit = 10 }) => {
        try {
            const url = new URL(`${BASE_URL}/video/`);

            if (userId) url.searchParams.set("userId", userId);
            if (query) url.searchParams.set("query", query);
            if (page) url.searchParams.set("page", page);
            if (limit) url.searchParams.set("limit", limit);
            if (sortBy && sortType) {
                url.searchParams.set("sortBy", sortBy);
                url.searchParams.set("sortType", sortType);
            }

            const response = await axiosInstance.get(url);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || "Failed to fetch videos");
            throw error;
        }
    }
);

export const publishAvideo = createAsyncThunk(
    "video/publishAvideo",
    async (data) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("videoFile", data.videoFile[0]);
        formData.append("thumbnail", data.thumbnail[0]);

        try {
            const response = await axiosInstance.post("/video", formData);
            toast.success(response?.data?.message || "Video published successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || "Failed to publish video");
            throw error;
        }
    }
);

export const updateAVideo = createAsyncThunk(
    "video/updateAVideo",
    async ({ videoId, data }) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("thumbnail", data.thumbnail[0]);

        try {
            const response = await axiosInstance.patch(`/video/v/${videoId}`, formData);
            toast.success(response?.data?.message || "Video updated successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || "Failed to update video");
            throw error;
        }
    }
);

export const deleteAVideo = createAsyncThunk(
    "video/deleteAVideo",
    async (videoId) => {
        try {
            const response = await axiosInstance.delete(`/video/v/${videoId}`);
            toast.success(response?.data?.message || "Video deleted successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || "Failed to delete video");
            throw error;
        }
    }
);

export const getVideoById = createAsyncThunk(
    "video/getVideoById",
    async ({ videoId }) => {
        try {
            const response = await axiosInstance.get(`/video/v/${videoId}`);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || "Failed to fetch video");
            throw error;
        }
    }
);

export const togglePublishStatus = createAsyncThunk(
    "video/togglePublishStatus",
    async (videoId) => {
        try {
            const response = await axiosInstance.patch(`/video/toggle/publish/${videoId}`);
            toast.success(response.data.message || "Publish status toggled successfully");
            return response.data.data.isPublished;
        } catch (error) {
            toast.error(error?.response?.data?.error || "Failed to toggle publish status");
            throw error;
        }
    }
);

// Slice
const videoSlice = createSlice({
    name: "video",
    initialState,
    reducers: {
        updateUploadState: (state) => {
            state.uploading = false;
            state.uploaded = false;
        },
        makeVideosNull: (state) => {
            state.videos.docs = [];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getAllVideos.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getAllVideos.fulfilled, (state, action) => {
            state.loading = false;
            const docs = action.payload.docs; // Ensure docs is an array, default to empty array if not
            state.videos.docs = [...state.videos.docs, ...docs];
            state.videos.hasNextPage = action.payload.hasNextPage;
        });
        builder.addCase(getAllVideos.rejected, (state) => {
            state.loading = false;
        });
        builder.addCase(publishAvideo.pending, (state) => {
            state.uploading = true;
        });
        builder.addCase(publishAvideo.fulfilled, (state) => {
            state.uploading = false;
            state.uploaded = true;
        });
        builder.addCase(publishAvideo.rejected, (state) => {
            state.uploading = false;
        });
        builder.addCase(updateAVideo.pending, (state) => {
            state.uploading = true;
        });
        builder.addCase(updateAVideo.fulfilled, (state) => {
            state.uploading = false;
            state.uploaded = true;
        });
        builder.addCase(updateAVideo.rejected, (state) => {
            state.uploading = false;
        });
        builder.addCase(deleteAVideo.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(deleteAVideo.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(deleteAVideo.rejected, (state) => {
            state.loading = false;
        });
        builder.addCase(getVideoById.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getVideoById.fulfilled, (state, action) => {
            state.loading = false;
            state.video = action.payload;
        });
        builder.addCase(getVideoById.rejected, (state) => {
            state.loading = false;
        });
        builder.addCase(togglePublishStatus.fulfilled, (state) => {
            state.publishToggled = !state.publishToggled;
        });
    },
});

export const { updateUploadState, makeVideosNull } = videoSlice.actions;

export default videoSlice.reducer;
