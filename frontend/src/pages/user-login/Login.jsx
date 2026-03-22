import { useState, useRef } from "react";
import useLoginStore from "../../store/useLoginStore";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import logoW from "../../assets/logo-w.png";
import * as yup from "yup";
import { FaEye, FaEyeSlash, FaUser, FaArrowLeft, FaPlus } from "react-icons/fa";
import avatars from "../../utils/avatars";
import { useNavigate } from "react-router-dom";
import Google from "./Google";
import {
  loginUser,
  registerUser,
  updateUserProfile,
  verifyOtp,
} from "../../services/user.service";
import { toast } from "react-toastify";
import Spinner from "../../utils/spinner";
import { sendEmail } from "../../utils/sendEmail";
import useUserStore from "../../store/useUserStore";
import ForgotPasswordHTML from "./ForgotPass";
import LanguageSwitcher from "../more-section/LanguageSwitcher";
import useTranslation from "../../hooks/useTranslation";

// Validation Schema

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

const otpValidationSchema = yup.object().shape({
  otp: yup
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .required("OTP is required"),
});
const profileValidationSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  agreed: yup.bool().oneOf([true], "You must agree to the terms"),
});

const Login = () => {
  const { step, setStep, setUserPhoneData, userPhoneData, resetLoginState } =
    useLoginStore();
  const [isLogin, setIsLogin] = useState(true);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useUserStore();
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const { t } = useTranslation();

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    // formState: { errors: loginErrors },
  } = useForm({
    resolver: yupResolver(loginValidationSchema),
  });

  const {
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    setValue: setOtpValue,
  } = useForm({
    resolver: yupResolver(otpValidationSchema),
  });

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    watch,
  } = useForm({
    resolver: yupResolver(profileValidationSchema),
  });

  const ProgressBar = () => (
    <div className="w-full bg-zinc-800 border border-zinc-700 rounded-full h-2.5 mb-8 overflow-hidden">
      <div
        className="bg-gradient-to-r from-emerald-500 to-green-500 h-2.5 rounded-full transition-all duration-700 ease-in-out relative flex items-center justify-end shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        style={{ width: `${(step / 3) * 100}%` }}
      >
        <div className="w-2 h-2 bg-white rounded-full mr-1 opacity-50 blur-[1px]"></div>
      </div>
    </div>
  );

  const onLoginSubmit = async () => {
    let userName;
    try {
      setLoading(true);
      if (isLogin) {
        // 🔵 LOGIN LOGIC
        if (!email || !password) {
          toast.error("Please enter email and password");
          return;
        }

        const response = await loginUser(email, password);

        userName = response?.user?.username;
        if (response?.status === true) {
          toast.success(`Successfully Logged in ${userName}`);
          localStorage.setItem("auth_token", response.token); // Save token
          setUser(response.user); // Update store
          
          // Direct users to their dashboard if they have a role
          const userRole = response.user?.role;
          if (userRole === 'admin') {
            navigate("/admin-dashboard");
          } else if (userRole === 'buyer') {
            navigate("/buyer-dashboard");
          } else if (userRole === 'farmer') {
            navigate("/");
          } else {
            navigate("/role");
          }
          
          resetLoginState();
        } else {
          toast.error(response?.message || "Login failed");
        }
      } else {
        // 🟢 REGISTER LOGIC
        if (!username || !email || !password) {
          toast.error("Please fill all fields");
          return;
        }

        const response = await registerUser(username, email, password);
        if (response?.status === "success" || response?.status === true) {
          console.log(response.user);
          // Dev Fallback: Since backend SMTP is completely removed and EmailJS only has 1 template 
          // (Welcome Email), we print the OTP to the UI so you aren't permanently locked out of registration!
          const otpCode = response?.data?.otp || response?.otp;
          toast.success(`OTP generated (Dev Only): ${otpCode}`);
          
          setUserPhoneData({ username, email });
          setStep(2);
        } else {
          toast.error(response?.message || "Otp failed to send");
        }
      }
    } catch (error) {
      console.error(error);
      const errMessage = typeof error === 'string' ? error : error?.message;
      const fallbackMessage = isLogin ? "Login failed 🚨" : "Otp failed to send 🚨";
      toast.error(errMessage || fallbackMessage);
    } finally {
      setLoading(false);
    }
    // toast.success("hello!!!");
    // setUserPhoneData({ userName, email });
    // setStep(2);
  };

  const onOtpSubmit = async () => {
    try {
      setLoading(true);
      if (!userPhoneData) {
        throw new Error("Phone or Email data is missing");
      }
      const otpString = otp.join("");
      let response;
      if (userPhoneData?.email) {
        response = await verifyOtp(userPhoneData.email, otpString);
      } else {
        console.log("no data found!");
      }

      if (response.status === "success") {
        toast.success("OTP verified successfully");
        const user = response.data?.user;
        const token = response.data?.token;
        
        localStorage.setItem("auth_token", token); // Save token
        
        if (user.username && user?.profilePicture) {
          setUser(user);
          toast.success("Welcome back...");
          navigate("/role");
          resetLoginState();
        } else {
          setStep(3);
        }
      }
    } catch (error) {
      console.log(error);
      // setError(error.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpValue("otp", newOtp.join(""));

    // Move forward safely
    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus(); // ✅ SAFE
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputsRef.current[index - 1]?.focus(); // ✅ SAFE
      }
    }
  };

  const onProfileSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("agreed", data.agreed);
      if (profilePictureFile) {
        formData.append("media", profilePictureFile);
      } else {
        formData.append("profilePicture", selectedAvatar);
      }

      await updateUserProfile(formData);

      // ✅ Gracefully trigger Welcome Email from the Frontend
      if (userPhoneData?.email) {
          sendEmail({
              username: data.username,
              email: userPhoneData.email
          }); // We purposefully don't "await" so UI doesn't freeze
      }

      toast.success(`Welcome back, ${data.username}`);
      navigate("/role");
      resetLoginState();
    } catch (error) {
      console.log(error);
      // setError(error.message || "Failed to update user profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleBack = () => {
    setStep(1);
    setUserPhoneData(null);
    setOtp(["", "", "", "", "", ""]);
    // setError("");
  };

  const goToRegistration = () => {
    if (isLogin) setIsLogin(false);
    else setIsLogin(true);
    // navigate("/registration");
  };

  // const goToForgotPass = () => {
  //   <ForgotPasswordHTML />
  //   console.log("forgot password")
  // }

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
          <div className="w-32 h-32 mb-6 bg-white/5 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-white/10">
            <img className="w-full h-full object-contain filter drop-shadow-lg" src={logoW} alt="Kisan Mithr Logo" />
          </div>
          
          <h1 className="text-4xl lg:text-5xl tracking-tight font-bold mb-4 drop-shadow-lg text-white">
            {t("kisanMithr")}
          </h1>
          <p className="text-emerald-400 text-lg lg:text-xl font-medium mb-8 max-w-sm leading-relaxed">
            {t("yoursmartfarmingpartner")}
          </p>
          
          <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-8 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          
          <p className="text-zinc-400 text-base max-w-[280px] leading-relaxed">
            {t("getAIcroprecommendationsrealtimeweatherforecastsandlivemarketprices")}
          </p>
        </div>
      </div>

      {/* Right Side - Form Container */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-4 sm:p-8 lg:p-16 relative bg-transparent z-10 min-h-[100dvh]">
        <header className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-50">
          <LanguageSwitcher />
        </header>

        {/* Brand Header for Mobile Only */}
        <div className="flex lg:hidden flex-col items-center justify-center mb-8 mt-16 sm:mt-12 animate-fadeIn">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 bg-white/5 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white/10">
            <img className="w-full h-full object-contain filter drop-shadow-md" src={logoW} alt="Kisan Mithr Logo" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
            {t("kisanMithr")}
          </h1>
        </div>

        <div className="w-full max-w-lg w-full bg-zinc-900/40 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 mx-auto">
        {step === 1 && (
          <div className="flex flex-col animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
                {isLogin ? t("welcomeBack") : t("createaccount")}
              </h2>
              <p className="text-zinc-400 font-medium text-sm sm:text-base">
                {isLogin
                  ? t("signintoaccess")
                  : t("jointhousandsoffarmersusingsmartagriculture")}
              </p>
              </div>

              <ProgressBar />

              <form
                className="space-y-5"
                onSubmit={handleLoginSubmit(onLoginSubmit)}
              >
                {/* Username in registration */}
                {!isLogin && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                      <FaUser className="w-5 h-5"/>
                    </div>
                    <input
                      type="text"
                      placeholder="Username"
                      {...loginRegister("username")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-5 py-3.5 pl-11 bg-zinc-800/40 backdrop-blur-sm border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:bg-zinc-800/80 transition-all font-medium placeholder:text-zinc-500 placeholder:font-normal shadow-inner hover:bg-zinc-800/60"
                    />
                  </div>
                )}

                {/* Email Input Box */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg>
                  </div>
                  <input
                    type="email"
                    placeholder={t("email")}
                    {...loginRegister("email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3.5 pl-11 bg-zinc-800/40 backdrop-blur-sm border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:bg-zinc-800/80 transition-all font-medium placeholder:text-zinc-500 placeholder:font-normal shadow-inner hover:bg-zinc-800/60"
                  />
                </div>
                {/* Password Input Box */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3.5 pl-11 bg-zinc-800/40 backdrop-blur-sm border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:bg-zinc-800/80 transition-all font-medium placeholder:text-zinc-500 placeholder:font-normal shadow-inner hover:bg-zinc-800/60"
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-zinc-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </div>
                </div>

                {isLogin && (
                  <div className="flex justify-end mt-2">
                    <span
                      className="text-sm font-semibold text-emerald-700 cursor-pointer hover:text-emerald-600 hover:underline transition-colors"
                      onClick={() => navigate("/forgot-password")}
                    >
                      {t("forgotpassword")}
                    </span>
                  </div>
                )}

                <div className="w-full pt-4">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-xl hover:from-emerald-400 hover:to-teal-400 hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.6)] transition-all ease-in-out duration-300 transform hover:-translate-y-1"
                  >
                    {loading ? (
                      <Spinner />
                    ) : (
                      <>
                        {isLogin ? t("login") : t("sendOtp")}
                        <span className="material-symbols-outlined">
                          arrow_right_alt
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 text-center text-zinc-400">
                  {isLogin ? (
                    <p className="text-sm font-medium">
                      {t("donthaveanaccount")}{" "}
                      <span
                        className="text-emerald-600 font-bold hover:text-emerald-700 cursor-pointer hover:underline transition-colors ml-1"
                        onClick={goToRegistration}
                      >
                        {t("register")}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm font-medium">
                      {t("alreadyhaveanaccount")}{" "}
                      <span
                        className="text-emerald-600 font-bold hover:text-emerald-700 cursor-pointer hover:underline transition-colors ml-1"
                        onClick={goToRegistration}
                      >
                        {t("login")}
                      </span>
                    </p>
                  )}
                </div>
              </form>

              {/* divider with ----or---- */}
              <div className="flex items-center my-8">
                <div className="flex-grow h-[1px] bg-zinc-800" />
                <span className="mx-4 text-zinc-500 text-sm font-bold uppercase tracking-widest">
                  {t("or")}
                </span>
                <div className="flex-grow h-[1px] bg-zinc-800" />
              </div>

              {/* Google Sign in */}
              <div className="w-full flex justify-center hover:-translate-y-0.5 transition-transform duration-300">
                <Google />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col animate-fadeIn">
              <div className="w-full flex flex-col items-center justify-center text-center mb-8">
                <div className="w-16 h-16 bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  OTP Verification
                </h2>
                <ProgressBar />
                <p className="text-zinc-400 font-medium">
                  Enter the 6-digit code sent to <br/><span className="text-emerald-400 font-bold">{userPhoneData?.email}</span>
                </p>
              </div>

              <div>
                <form
                  onSubmit={handleOtpSubmit(onOtpSubmit)}
                  className="space-y-6"
                >
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        ref={(el) => {
                          inputsRef.current[index] = el;
                        }}
                        className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-zinc-800/50 backdrop-blur-sm border border-white/10 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-inner transition-all hover:bg-zinc-800/80 ${
                          otpErrors.otp ? "border-red-500 focus:ring-red-500/50" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <div className="py-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg rounded-xl cursor-pointer hover:from-emerald-400 hover:to-teal-400 shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.6)] transition-all ease-in-out duration-300 transform hover:-translate-y-1 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {loading ? <Spinner /> : <span>Verify OTP</span>}
                    </button>
                  </div>
                  <div className="pb-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-full flex items-center justify-center py-4 bg-zinc-800/40 text-zinc-300 font-bold text-lg rounded-xl border border-white/10 cursor-pointer hover:bg-zinc-700/50 hover:text-white transition-all duration-300 backdrop-blur-sm"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <FaArrowLeft size={16}/> Back to Login
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col animate-fadeIn">
              <div className="text-center mb-8">
                 <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">Complete Profile</h2>
                 <p className="text-zinc-400 font-medium text-sm sm:text-base">Almost there! Setup your identity.</p>
              </div>
            <form
              onSubmit={handleProfileSubmit(onProfileSubmit)}
              className="space-y-6"
            >
              <div className="flex flex-col items-center mb-4">
                <div className="relative w-24 h-24 mb-2">
                  <img
                    src={profilePicture || selectedAvatar}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full cursor-pointer hover:bg-green-600 transition duration-300"
                  >
                    <FaPlus className="w-4 h-4" />
                  </label>
                  <input
                    type="file"
                    id="profile-picture"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <div className="w-full h-[1px] bg-zinc-800 my-4"></div>
                <div className="flex flex-wrap justify-center gap-3">
                  {avatars.map((avatar, index) => (
                    <img
                      key={index}
                      src={avatar}
                      alt={`Avatar-${index + 1}`}
                      className={`w-14 h-14 rounded-full cursor-pointer transition-all duration-300 transform hover:scale-110 shadow-sm ${
                        selectedAvatar === avatar ? "ring-4 ring-emerald-500 shadow-lg scale-110" : "hover:ring-2 hover:ring-zinc-300 opacity-80 hover:opacity-100"
                      }`}
                      onClick={() => setSelectedAvatar(avatar)}
                    />
                  ))}
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                  <FaUser className="w-5 h-5"/>
                </div>

                <input
                  {...profileRegister("username")}
                  type="text"
                  placeholder="Choose a Username"
                  className="w-full px-5 py-3.5 pl-11 bg-zinc-800/40 backdrop-blur-sm border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:bg-zinc-800/80 transition-all font-medium placeholder:text-zinc-400 hover:bg-zinc-800/60"
                />

                {profileErrors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileErrors.username.message}
                  </p>
                )}
              </div>

              <div className="flex w-full items-start space-x-3 bg-zinc-800/30 p-5 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="mt-1">
                  <input
                    {...profileRegister("agreed")}
                    type="checkbox"
                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium text-zinc-300"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-emerald-400 font-bold hover:underline">
                      Terms and Conditions
                    </a>{" "}
                    and Privacy Policy.
                  </label>
                  {profileErrors.agreed && (
                    <p className="text-red-500 text-xs mt-1 font-bold">
                      {profileErrors.agreed.message}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={!watch("agreed") || loading}
                className={`w-full py-4 mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300 ease-in-out transform flex items-center justify-center tracking-wide
                ${loading || !watch("agreed") ? "opacity-60 cursor-not-allowed" : "hover:from-emerald-400 hover:to-teal-400 hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.6)] hover:-translate-y-1"}
                `}
              >
                {loading ? <Spinner /> : "Complete Setup & Enter"}
              </button>
            </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
