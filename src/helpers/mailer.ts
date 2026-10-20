
import User from "@/models/userModel";
import nodemailer from "nodemailer";
import { createHash, randomBytes } from "crypto";

type EmailType = "VERIFY" | "RESET";

interface SendEmailParams {
  email: string;
  emailType: EmailType;
  userId: string;
}

export const sendEmail = async ({
  email,
  emailType,
  userId,
}: SendEmailParams) => {
  const domain = process.env.DOMAIN;

  if (!domain) {
    throw new Error("DOMAIN is not configured");
  }

  // Generate a secure random token
  const token = randomBytes(32).toString("hex");

  // Hash the token before storing it
  const hashedToken = createHash("sha256")
    .update(token)
    .digest("hex");

  const expiry = new Date(Date.now() + 60 * 60 * 1000);

  const isVerification = emailType === "VERIFY";

  const path = isVerification
    ? "/verifyemail"
    : "/resetpassword";

  const url = new URL(path, process.env.DOMAIN);
  url.searchParams.set("token", token);

  const update = isVerification
    ? {
        verifyToken: hashedToken,
        verifyTokenExpiry: expiry,
      }
    : {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: expiry,
      };

  const user = await User.findByIdAndUpdate(
    userId,
    update
  );

  if (!user) {
    throw new Error("User not found");
  }

  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: Number(process.env.MAILTRAP_PORT || 2525),
    secure: false,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  const action = isVerification
    ? "Verify email"
    : "Reset password";

  return await transport.sendMail({
    from: "authflow@gmail.com",
    to: email,
    subject: action,
    text: `${action}: ${url.toString()}`,
    html: `
      <p>Please use the link below:</p>
      <p><a href="${url.toString()}">${action}</a></p>
      <p>This link expires in one hour.</p>
    `,
  });
};
