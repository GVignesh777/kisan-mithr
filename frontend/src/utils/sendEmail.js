import emailjs from '@emailjs/browser';

/**
 * Sends an email using EmailJS directly from the React frontend.
 * Ensure your EmailJS dashboard template expects {{name}} and {{email}} variables.
 * @param {Object} userData - Dynamic data mapping
 * @param {string} templateType - 'OTP' or 'FORGOT_PASSWORD'
 */
export const sendEmail = async (userData, templateType) => {
    // Graceful fallback: User asked for VITE_ but project uses Create React App (REACT_APP_)
    const serviceID = process.env.VITE_EMAILJS_SERVICE_ID || process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const publicKey = process.env.VITE_EMAILJS_PUBLIC_KEY || process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

    let templateID;
    if (templateType === 'OTP') {
        templateID = process.env.VITE_EMAILJS_OTP_TEMPLATE_ID || process.env.REACT_APP_EMAILJS_OTP_TEMPLATE_ID;
    } else if (templateType === 'FORGOT_PASSWORD') {
        templateID = process.env.VITE_EMAILJS_FORGOT_TEMPLATE_ID || process.env.REACT_APP_EMAILJS_FORGOT_TEMPLATE_ID;
    } else {
        templateID = process.env.VITE_EMAILJS_TEMPLATE_ID || process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    }

    if (!serviceID || !templateID || !publicKey) {
        console.warn(`⚠️ EmailJS env variables are missing for ${templateType}. Skipping email trigger.`);
        return { success: false, message: "Missing EmailJS keys" };
    }

    try {
        const templateParams = {
            name: userData.username || userData.name || "User",
            email: userData.email,
            ...userData // Dynamically spreads { otp_code } or { reset_link }
        };

        const response = await emailjs.send(
            serviceID, 
            templateID, 
            templateParams, 
            publicKey
        );
        
        console.log(`✅ ${templateType} Email successfully sent via EmailJS!`, response.status, response.text);
        return { success: true, response };
    } catch (error) {
        console.error(`❌ EmailJS sending failed for ${templateType}:`, error);
        return { success: false, error };
    }
};
