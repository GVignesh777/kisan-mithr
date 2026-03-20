import axiosInstance from "./url.service";



export const createNewConversation = async (userId) => {
    try {
        const response = await axiosInstance.post('/create', { userId });
        console.log("triggering new conversation creation...");
        console.log(response.data);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message
    }
}


export const addMessageToConversation = async ({ conversationId, role, content }) => {
    try {
        console.log("conversationId", conversationId); // string ID
        console.log("role", role);                     // "user" or "assistant"
        console.log("content", content);               // message text

        const response = await axiosInstance.post('/addMessage', { conversationId, role, content });
        console.log("triggering add message to conversation");
        console.log(response.data);

        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};

export const getAllConversations = async (userId) => {
    try {
        const response = await axiosInstance.get(`/user/${userId}`);
        console.log("triggering get all conversations...");
        console.log(response.data);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message

    }
}