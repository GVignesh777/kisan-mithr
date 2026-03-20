import logo from "../../assets/logo.jpg";
import { useEffect, useState } from "react";
import useUserStore from "../../store/useUserStore";
import { checkUserAuth } from "../../services/user.service";
import LanguageSwitcher from "../../pages/more-section/LanguageSwitcher";
import DropdownFeature from "./DropdownFeature";
import DropdownHome from "./DropdownHome";
import DropdownAbout from "./DropdownAbout";
import DropdownMarketplace from "./DropdownMarketplace";
import DropdownSchemes from "./DropdownSchemes";
import DropdownContact from "./DropdownContact";
import DropdownProfile from "./DropdownProfile";

export default function Header() {
  const user = useUserStore((state) => state.user); // get user from store
  const setUser = useUserStore((state) => state.setUser); // action to update user

  const [scrolled, setScrolled] = useState(false);

  // Local state for profile image
  const [userPicture, setUserPicture] = useState(
    user?.profilePicture || user?.googlePhoto || null
  );

  // Fetch user data from API
  const getUser = async () => {
    try {
      const response = await checkUserAuth(); 
      if (response?.user) {
        setUser(response.user); // update store
        setUserPicture(response.user.profilePicture || response.user.googlePhoto || null);
      }
    } catch (error) {
      console.log("User not found ///", error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md py-1 shadow-black/50 rounded-b-md"
          : "bg-transparent py-2"
      }`}
    >
      <div className="mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <h1 className={`flex items-center text-2xl font-bold cursor-pointer`}>
          <img className="w-14 h-14" src={logo} alt="logo" />
          <span className="text-2xl font-spacegrotesk bg-gradient-to-r from-black via-black to-green-600 bg-clip-text text-transparent">
            Kisan Mithr
          </span>
        </h1>

        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          <div className="relative group">
            <a href="#" className="p-2 rounded-md hover:text-green-500">Home</a>
            <DropdownHome />
          </div>
          <div className="relative group">
            <a href="#" className="p-2 rounded-md hover:text-green-500">About</a>
            <DropdownAbout />
          </div>
          <div className="relative group">
            <a href="#" className="p-2 rounded-md hover:text-green-500">Services</a>
            <DropdownFeature />
          </div>
          <div className="relative group">
            <a href="#" className="p-2 rounded-md hover:text-green-500">Marketplace</a>
            <DropdownMarketplace />
          </div>
          <div className="relative group">
            <a href="#" className="p-2 rounded-md hover:text-green-500">Schemes</a>
            <DropdownSchemes />
          </div>
          <div className="relative group">
            <a href="#" className="p-2 rounded-md hover:text-green-500">Contact</a>
            <DropdownContact />
          </div>
        </nav>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* User Profile */}
        <div className="relative group flex items-center justify-center cursor-pointer ml-4">
          <div className={`w-12 h-12 flex items-center justify-center rounded-full ${scrolled ? "bg-transparent" : "bg-green-500/40"}`}>
            {userPicture ? (
              <img
                src={userPicture}
                alt="User"
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <svg
                className="m-2"
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#374151"
              >
                <path d="M367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q560-607 560-640t-23.5-56.5Q513-720 480-720t-56.5 23.5Q400-673 400-640t23.5 56.5Q447-560 480-560t56.5-23.5ZM480-640Zm0 400Z" />
              </svg>
            )}
          </div>
          <DropdownProfile />
        </div>
      </div>
    </header>
  );
}