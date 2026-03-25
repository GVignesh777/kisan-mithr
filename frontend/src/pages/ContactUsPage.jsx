import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { sendEmail } from "../utils/sendEmail";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  Mic, 
  MicOff, 
  ChevronDown, 
  ChevronUp,
  Github,
  Linkedin,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";
import Header from "../components/header/Header";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";

// Validation Schema
const schema = yup.object().shape({
  fullName: yup.string().required("Full Name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  phone: yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  subject: yup.string().required("Please select a subject"),
  message: yup.string().min(10, "Message must be at least 10 characters").required("Message is required"),
});

const ContactUsPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      subject: "Support"
    }
  });

  const messageValue = watch("message");

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // WhatsApp Submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const adminPhone = process.env.REACT_APP_ADMIN_WHATSAPP_NUMBER || "919440602166";
      
      // Verification log (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log("Using WhatsApp Number:", adminPhone);
      }
      
      // Construct the WhatsApp message
      const message = `*Kisan Mithr - New Inquiry*%0A%0A` +
                      `*Name:* ${data.fullName}%0A` +
                      `*Email:* ${data.email}%0A` +
                      `*Phone:* ${data.phone}%0A` +
                      `*Subject:* ${data.subject}%0A` +
                      `*Message:* ${data.message}`;

      const whatsappUrl = `https://wa.me/${adminPhone}?text=${message}`;

      // Open in a new tab
      window.open(whatsappUrl, "_blank");

      toast.success("WhatsApp redirection initiated! Please send the message in the opened window.", {
        icon: <CheckCircle2 className="text-green-500" />
      });
      
      reset();
    } catch (error) {
      console.error("WhatsApp Error:", error);
      toast.error("Failed to initiate WhatsApp. Please try again later.", {
        icon: <AlertCircle className="text-red-500" />
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Voice Input Implementation
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      toast.warning("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    if (isListening) {
      setIsListening(false);
      recognition.stop();
    } else {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setValue("message", (messageValue || "") + " " + transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        toast.error("Speech recognition failed. Please try again.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  };

  const faqs = [
    {
      q: "How can I register as a farmer?",
      a: "You can register by clicking the 'Register' button on the login page and choosing the 'Farmer' role during setup."
    },
    {
      q: "Is there any cost to use Kisan Mithr?",
      a: "Kisan Mithr is free for farmers to access market prices, weather updates, and basic crop health tools."
    },
    {
      q: "How do I contact technical support?",
      a: "You can use this contact form and select 'Support' as the subject, or call our helpline during support hours."
    },
    {
      q: "Can I sell my crops directly on the platform?",
      a: "Yes, our Marketplace feature allows farmers to list their produce for buyers to browse and contact them directly."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-green-500/30">
      <Header />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Kisan Mithr</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            We are here to help farmers. Reach out to us anytime for support, feedback, or inquiries.
          </p>
          <div className="w-24 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact Info & Socials */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="p-2 bg-green-500/10 rounded-lg text-green-400">
                   <Phone size={24} />
                </span>
                Contact Information
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-zinc-800/50 rounded-2xl flex items-center justify-center text-green-400 border border-zinc-700">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider mb-1">Email Us</p>
                    <p className="text-lg font-bold text-zinc-200">support@kisanmithr.com</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-zinc-800/50 rounded-2xl flex items-center justify-center text-green-400 border border-zinc-700">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider mb-1">Call Us</p>
                    <p className="text-lg font-bold text-zinc-200">+91 91XXX XXXXX</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-zinc-800/50 rounded-2xl flex items-center justify-center text-green-400 border border-zinc-700">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider mb-1">Location</p>
                    <p className="text-lg font-bold text-zinc-200">Hyderabad, Telangana, India</p>
                  </div>
                </div>

                <div className="flex gap-4 border-t border-zinc-800 pt-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-zinc-800/50 rounded-2xl flex items-center justify-center text-green-400 border border-zinc-700">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider mb-1">Support Hours</p>
                    <p className="text-lg font-bold text-zinc-200">Mon - Sat: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-zinc-800">
                <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider mb-4">Follow Us</p>
                <div className="flex gap-4">
                  <a 
                    href="https://github.com/GVignesh777" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300"
                  >
                    <Github size={24} />
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/g-vignesh-b6b6a2361/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white hover:bg-[#0077b5] hover:border-[#0077b5] transition-all duration-300"
                  >
                    <Linkedin size={24} />
                  </a>
                </div>
              </div>
            </div>

            {/* Simple FAQ Preview */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl mt-8">
              <h3 className="text-xl font-bold mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                    <button 
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <span className="text-sm font-semibold text-zinc-300 group-hover:text-green-400 transition-colors">{faq.q}</span>
                      {activeFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <AnimatePresence>
                      {activeFaq === idx && (
                        <motion.p 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-2 text-xs text-zinc-500 leading-relaxed overflow-hidden"
                        >
                          {faq.a}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden group">
               {/* Decorative Gradient Overlay */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

               <h3 className="text-3xl font-extrabold text-white mb-8 tracking-tight relative z-10">Send us a Message</h3>
               
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                 <div className="grid sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-zinc-400 ml-1">Full Name</label>
                     <input 
                       {...register("fullName")}
                       className={`w-full px-5 py-4 bg-zinc-950/50 border ${errors.fullName ? 'border-red-500/50' : 'border-zinc-800'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition-all font-medium text-white placeholder:text-zinc-600`}
                       placeholder="e.g. John Doe"
                     />
                     {errors.fullName && <p className="text-red-500 text-xs mt-1 font-bold ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.fullName.message}</p>}
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-bold text-zinc-400 ml-1">Email Address</label>
                     <input 
                       {...register("email")}
                       className={`w-full px-5 py-4 bg-zinc-950/50 border ${errors.email ? 'border-red-500/50' : 'border-zinc-800'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition-all font-medium text-white placeholder:text-zinc-600`}
                       placeholder="e.g. help@farmer.com"
                     />
                     {errors.email && <p className="text-red-500 text-xs mt-1 font-bold ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.email.message}</p>}
                   </div>
                 </div>

                 <div className="grid sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-zinc-400 ml-1">Phone Number</label>
                     <input 
                       {...register("phone")}
                       className={`w-full px-5 py-4 bg-zinc-950/50 border ${errors.phone ? 'border-red-500/50' : 'border-zinc-800'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition-all font-medium text-white placeholder:text-zinc-600`}
                       placeholder="+91 XXXXX XXXXX"
                     />
                     {errors.phone && <p className="text-red-500 text-xs mt-1 font-bold ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.phone.message}</p>}
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-bold text-zinc-400 ml-1">Subject</label>
                     <div className="relative">
                        <select 
                          {...register("subject")}
                          className="w-full px-5 py-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition-all font-medium text-white appearance-none cursor-pointer"
                        >
                          <option value="Support">Support</option>
                          <option value="Feedback">Feedback</option>
                          <option value="Complaint">Complaint</option>
                          <option value="Inquiry">Inquiry</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={20} />
                     </div>
                   </div>
                 </div>

                 <div className="space-y-2">
                   <div className="flex justify-between items-center ml-1">
                     <label className="text-sm font-bold text-zinc-400">Your Message</label>
                     <button 
                       type="button" 
                       onClick={toggleListening}
                       className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
                     >
                       {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                       {isListening ? "Stop Recording" : "Use Voice Input"}
                     </button>
                   </div>
                   <textarea 
                     {...register("message")}
                     rows={5}
                     className={`w-full px-5 py-4 bg-zinc-950/50 border ${errors.message ? 'border-red-500/50' : 'border-zinc-800'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition-all font-medium text-white placeholder:text-zinc-600 resize-none`}
                     placeholder="How can we help you today?"
                   />
                   {errors.message && <p className="text-red-500 text-xs mt-1 font-bold ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.message.message}</p>}
                 </div>

                 <button 
                   type="submit" 
                   disabled={isSubmitting}
                   className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-black text-lg rounded-2xl shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.6)] transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
                 >
                   {isSubmitting ? (
                     <div className="flex items-center gap-2">
                       <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                       <span>Sending...</span>
                     </div>
                   ) : (
                     <span className="flex items-center gap-2">
                        Send Message <Send size={20} />
                     </span>
                   )}
                 </button>
               </form>
            </div>
            
            {/* Maps Embed */}
            <div className="mt-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden h-[300px] relative group border-t-4 border-t-green-500/40">
                <iframe 
                    title="Kisan Mithr Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.3160407147!2d78.26795907482598!3d17.41229980164627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1711382400000!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2)' }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                <div className="absolute inset-x-0 bottom-0 p-4 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-xs font-bold text-green-400 uppercase tracking-widest text-center">Visit our regional headquarters</p>
                </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUsPage;
