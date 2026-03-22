import emailjs from '@emailjs/browser';

/**
 * Sends a welcome email to the user using EmailJS directly from the browser.
 * Make sure you have connected your Gmail service in the EmailJS dashboard.
 */
export const sendWelcomeEmail = async (userData) => {
    // These keys must be set in your Vercel (or local .env) environment variables
    const serviceID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

    if (!serviceID || !templateID || !publicKey) {
        console.warn("⚠️ EmailJS environment variables are missing. Skipping welcome email.");
        return { success: false, message: "Missing EmailJS keys" };
    }

    try {
        // These keys must exactly match the {{variable}} names in your EmailJS Template
        const templateParams = {
            to_name: userData.username,
            to_email: userData.email,
        };

        const response = await emailjs.send(
            serviceID, 
            templateID, 
            templateParams, 
            publicKey
        );
        
        console.log('✅ Welcome email successfully sent via EmailJS!', response.status, response.text);
        return { success: true, response };
    } catch (error) {
        console.error('❌ EmailJS sending failed:', error);
        return { success: false, error };
    }
};
