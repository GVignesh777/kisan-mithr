import logoW from "../../assets/logo-w.png";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { toast } from "react-toastify";
import { resetUserPassword } from "../../services/user.service";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import Spinner from "../../utils/spinner";

const loginValidationSchema = yup
  .object()
  .shape({
    email: yup
      .string()
      .nullable()
      .notRequired()
      .email("Please Enter a valid email")
      .transform((value, originalValue) => {
        if (typeof originalValue === "string" && originalValue.trim() === "") {
          return null;
        }
        return value;
      }),
  })
  .test("at-least-one", "Either email is required", function (value) {
    return !!value.email;
  });

const ResetPasswordHTML = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);



  const onResetPassSubmit = async (e) => {
    try {
      console.log(password);
      setLoading(true);
      if (!password) {
        toast.error("Please enter password");
        return;
      }
      const response = await resetUserPassword(token, password);

      if (response?.status === "success") {
        toast.success(`Successfully Reset Password`);
      } else {
        toast.error(response?.message || "Failed to Reset Password, Try Again Later!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/user-login");
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col lg:flex-row font-sans relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Left Side - Brand & Info Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 p-12 text-white flex-col items-center justify-center text-center relative overflow-hidden group border-r border-zinc-800/50">
        {/* subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center transform transition-transform duration-700 group-hover:scale-105">
            <div className="w-32 h-32 mb-6 bg-white/10 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-white/20">
              <img className="w-full h-full object-contain filter drop-shadow-lg" src={logoW} alt="Kisan Mithr Logo" />
            </div>
            
            <h1 className="text-4xl lg:text-5xl tracking-tight font-bold mb-4 drop-shadow-lg text-white">
              Kisan Mithr
            </h1>
            <p className="text-emerald-400 text-lg lg:text-xl font-medium mb-8 max-w-sm leading-relaxed">
              Your Smart Farming Partner
            </p>
            
            <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-8 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            
            <p className="text-zinc-400 text-base max-w-[280px] leading-relaxed">
              Get AI crop recommendations, real-time weather forecasts, and live market prices.
            </p>
          </div>
        </div>

        {/* Right Side - Form Container */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center p-8 lg:p-16 relative bg-transparent z-10">
          <div className="w-full max-w-md mx-auto flex flex-col animate-fadeIn">
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Enter New Password
              </h2>
              <p className="text-zinc-400 font-medium">
                Please enter a secure new password for your account below.
              </p>
            </div>

            <form
              className="space-y-6"
              onSubmit={(e) => { e.preventDefault(); onResetPassSubmit(); }}
            >
              {/* Password Input Box */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 pl-11 bg-zinc-900 border border-zinc-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium placeholder:text-zinc-500 shadow-inner"
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-zinc-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3.5 rounded-xl hover:from-emerald-600 hover:to-green-600 shadow-lg hover:shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] transition-all ease-in-out duration-300 transform hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {loading ? <Spinner /> : <span>Reset Password</span>}
                </button>
              </div>

              <div className="pb-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full flex items-center justify-center py-3.5 bg-zinc-900 text-zinc-300 font-bold text-lg rounded-xl border-2 border-zinc-800 cursor-pointer hover:bg-zinc-800 hover:text-white transition-all duration-300"
                >
                  <FaArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </button>
              </div>
            </form>

          </div>
        </div>
    </div>
  );
};

export default ResetPasswordHTML;
