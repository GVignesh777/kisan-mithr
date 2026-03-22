import logoW from "../../assets/logo-w.png";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { toast } from "react-toastify";
import { forgotUserPassword } from "../../services/user.service";
import Spinner from "../../utils/spinner";
import { sendEmail } from "../../utils/sendEmail";

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

const ForgotPasswordHTML = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register: loginRegister,
    handleSubmit: handleResetSubmit,
    // formState: { errors: loginErrors },
  } = useForm({
    resolver: yupResolver(loginValidationSchema),
  });

  const onForgotPassSubmit = async () => {
    try {
      console.log(email);
      setLoading(true);
      if (!email) {
        toast.error("Please enter email");
        return;
      }
      const response = await forgotUserPassword(email);

      if (response?.status === "success" || response?.success) {
        
        // Extract resetURL directly from new backend controller signature
        const resetLink = response?.resetURL || response?.data?.resetURL;
        
        if (resetLink) {
            sendEmail({
                email: email,
                reset_link: resetLink
            }, 'FORGOT_PASSWORD');
        } else {
            console.warn("Failed to retrieve reset URL from API");
        }

        toast.success(`Successfully sent Reset Link`);
      } else {
        toast.error(response?.message || "Reset Link failed to send");
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
        <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-4 sm:p-8 lg:p-16 relative bg-transparent z-10 min-h-[100dvh]">
          {/* Brand Header for Mobile Only */}
          <div className="flex lg:hidden flex-col items-center justify-center mb-8 mt-16 sm:mt-12 animate-fadeIn">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 bg-white/5 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white/10">
              <img className="w-full h-full object-contain filter drop-shadow-md" src={logoW} alt="Kisan Mithr Logo" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
              Kisan Mithr
            </h1>
          </div>

          <div className="w-full max-w-lg bg-zinc-900/40 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 mx-auto flex flex-col animate-fadeIn">
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
                Forgot Your Password?
              </h2>
              <p className="text-zinc-400 font-medium text-sm sm:text-base">
                Enter your registered email address and we’ll send you a reset link to get back into your account.
              </p>
            </div>

            <form
              className="space-y-6"
              onSubmit={(e) => { e.preventDefault(); handleResetSubmit(onForgotPassSubmit)(); }}
            >
              {/* Email Input Box */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg>
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  {...loginRegister("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 pl-11 bg-zinc-800/40 backdrop-blur-sm border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:bg-zinc-800/80 transition-all font-medium placeholder:text-zinc-500 shadow-inner hover:bg-zinc-800/60"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.6)] transition-all ease-in-out duration-300 transform hover:-translate-y-1 disabled:opacity-70"
                >
                  {loading ? <Spinner /> : <span>Send Reset Link</span>}
                </button>
              </div>

              <div className="pb-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full flex items-center justify-center py-4 bg-zinc-800/40 text-zinc-300 font-bold text-lg rounded-xl border border-white/10 cursor-pointer hover:bg-zinc-700/50 hover:text-white transition-all duration-300 backdrop-blur-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Back to Login
                </button>
              </div>
            </form>

          </div>
        </div>
    </div>
  );
};

export default ForgotPasswordHTML;
