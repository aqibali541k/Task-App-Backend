const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    // Create a transport. For development purposes we can simulate this with mailtrap or simply log out
    // Since production credentials are not provided, we will use a dummy service or Gmail if provided
    const transporter = nodemailer.createTransport({
        service: "gmail", // Can be customized
        auth: {
            user: process.env.EMAIL_USER || "test@example.com", // Fallback to avoid crash
            pass: process.env.EMAIL_PASS || "dummy_password", 
        },
    });

    const message = {
        from: `${process.env.FROM_NAME || "Todo App"} <${process.env.FROM_EMAIL || "noreply@todoapp.com"}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // Note: since credentials are dummy unless set in .env, this will throw an error!
    // So we wrap in try catch and we'll log it if it fails in dev but log the token anyway.
    try {
        await transporter.sendMail(message);
    } catch (err) {
        console.log("Email could not be sent (missing real credentials): ", err.message);
        console.log("\n=================================");
        console.log("MOCK EMAIL CONTENT:");
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: \n${options.message}`);
        console.log("=================================\n");
        // Still throw so the router knows but we can catch it specifically if we want
        // Actually, let's NOT throw so the user can test the reset flow reading the terminal!
        // throw new Error("Email could not be sent");
    }
};

module.exports = sendEmail;
