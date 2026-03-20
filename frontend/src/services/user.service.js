import axiosInstance from "./url.service";

export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post('/login', { email, password });
    console.log("triggering saving user data login")
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
}



export const registerUser = async (username, email, password) => {
  try {
    const response = await axiosInstance.post('/register', { username, email, password });
    console.log("triggering saving user data")
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
}


export const verifyOtp = async (email, otp) => {
  try {
    const response = await axiosInstance.post('/verifyOtp', { email, otp });
    console.log("triggering verify otp...")
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
}


export const updateUserProfile = async (updateData) => {
  try {
    const response = await axiosInstance.put('/updateProfile', updateData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
}

export const forgotUserPassword = async (email) => {
  try {
    const response = await axiosInstance.post('/forgotPassword', { email });
    console.log("triggering verify otp...")
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
}

export const resetUserPassword = async (token, password) => {
  try {
    const response = await axiosInstance.post(
      `/resetPassword/${token}`,   // ✅ correct URL
      { password }                 // ✅ must match backend
    );

    console.log("triggering reset password...");
    return response.data;

  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};


// Google service

export const googleLogin = async (token) => {
  try {
    const response = await axiosInstance.post('/google-login', { token });
    console.log("triggering google login...");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
}



export const selectRole = async (role) => {
  try {
    const response = await axiosInstance.post('/selectRole', { role });
    if(response.data.status === 'success' || response?.data?.status === 'success') {
      
    console.log("triggering select role...");
    return response.data;
    }
  } 
  catch (error) {
    throw error.response ? error.response.data : error.message;
  }
}

export const checkUserAuth = async () => {
  try {
    const response = await axiosInstance.get('/check-auth');
    console.log(response)
    if (response.data.status === 'success' || response?.data?.status === 'success') {
      // console.log(response)
      return { isAuthenticated: true, user: response?.data?.data }
    }
    else if (response.data === 'error') {
      return { isAuthenticated: false }
    }
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
}


export const logoutUser = async () => {
    try {
        const response = await axiosInstance.get('/logout');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}