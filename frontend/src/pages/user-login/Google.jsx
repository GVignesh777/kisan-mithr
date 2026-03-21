import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../store/useUserStore";
import { toast } from "react-toastify";
import { googleLogin } from "../../services/user.service";

const Google = () => {
  // ⚠️ Make sure this variable name is EXACT
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const { setUser } = useUserStore();
  const navigate = useNavigate();
  const [, setLoading] = useState(false);

  // const handleSuccess = async (credentialResponse) => {
  //   // credentialResponse.credential is the JWT token from Google
  //   try {
  //     const res = await fetch(`${process.env.REACT_APP_API_URL}/api/google-login`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ token: credentialResponse.credential }),
  //     });

  //     const data = await res.json();
  //     console.log("User saved to database:", data);
  //     toast.success("Logged in successfully with Google");
  //     setUser(data);
  //     navigate("/");
  //     // You can now save the backend session/JWT to local storage here
  //   } catch (error) {
  //     console.error("Error sending token to backend:", error);
  //   }
  // };

  const handleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const response = await googleLogin(credentialResponse.credential);
      if (response.status === "success") {
        console.log("User saved to database:", response.data);
        console.log("Login Response:", response);  
        
        localStorage.setItem("auth_token", response.token); // Save token
        toast.success("Logged in successfully with Google");
        setUser(response.data);
        navigate("/");
      } else {
        toast.error("Failed to login with Google");
      }
    } catch (error) {
      toast.error(error)
      console.error("Error sending token to backend:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center mt-3">
      <GoogleOAuthProvider clientId={googleClientId}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      </GoogleOAuthProvider>
    </div>
  );
};

export default Google;
