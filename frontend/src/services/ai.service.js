import axiosInstance from "./url.service";

export const ai_Response = async ({ message, language }) => {
    try {
        console.log("message", message);
        console.log("language", language);
        const response = await axiosInstance.post('/ask-ai', { message, language });
        console.log(response.data);
        console.log("triggering ai response...");
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message
    }

}
