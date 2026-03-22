import emailjs from '@emailjs/browser';

/**
 * Sends an email using EmailJS directly from the React frontend.
 * Ensure your EmailJS dashboard template expects {{name}} and {{email}} variables.
 */
export const sendEmail = async (userData) => {
    // Graceful fallback: User asked for VITE_ but project uses Create React App (REACT_APP_)
    const serviceID = process.env.VITE_EMAILJS_SERVICE_ID || process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateID = process.env.VITE_EMAILJS_TEMPLATE_ID || process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.VITE_EMAILJS_PUBLIC_KEY || process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

    if (!serviceID || !templateID || !publicKey) {
        console.warn("⚠️ EmailJS environment variables are missing. Skipping email trigger.");
        return { success: false, message: "Missing EmailJS keys" };
    }

    try {
        const templateParams = {
            name: userData.username || userData.name,
            email: userData.email,
        };

        const response = await emailjs.send(
            serviceID, 
            templateID, 
            templateParams, 
            publicKey
        );
        
        console.log('✅ Email successfully sent via EmailJS!', response.status, response.text);
        return { success: true, response };
    } catch (error) {
        console.error('❌ EmailJS sending failed:', error);
        return { success: false, error };
    }
};
