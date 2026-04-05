import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "Manokalpa <noreply@manokalpa.in>";

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your Manokalpa password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8f7ff;border-radius:16px;">
        <h2 style="color:#1e1b4b;margin-bottom:8px;">Reset Your Password</h2>
        <p style="color:#475569;margin-bottom:24px;">Hi ${name}, click the button below to reset your password. This link expires in 15 minutes.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#6c63ff;color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;">Reset Password</a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendOtpEmail(email: string, name: string, otp: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${otp} — Your Manokalpa login code`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8f7ff;border-radius:16px;">
        <h2 style="color:#1e1b4b;margin-bottom:8px;">Your Login Code</h2>
        <p style="color:#475569;margin-bottom:20px;">Hi ${name}, use the code below to sign in. It expires in 10 minutes.</p>
        <div style="background:#fff;border:2px solid #e2e8f0;border-radius:12px;padding:24px;text-align:center;margin-bottom:20px;">
          <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#6c63ff;">${otp}</span>
        </div>
        <p style="color:#94a3b8;font-size:12px;">If you didn't request this, someone may be trying to access your account.</p>
      </div>
    `,
  });
}

export async function sendAppointmentConfirmationEmail(
  email: string, name: string,
  counsellorName: string, date: string, time: string, meetingLink?: string
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your appointment is confirmed — Manokalpa",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8f7ff;border-radius:16px;">
        <h2 style="color:#1e1b4b;margin-bottom:8px;">Appointment Confirmed</h2>
        <p style="color:#475569;margin-bottom:16px;">Hi ${name}, your session has been confirmed!</p>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:20px;">
          <p style="margin:0 0 8px;color:#1e293b;"><strong>Counsellor:</strong> ${counsellorName}</p>
          <p style="margin:0 0 8px;color:#1e293b;"><strong>Date:</strong> ${date}</p>
          <p style="margin:0;color:#1e293b;"><strong>Time:</strong> ${time}</p>
        </div>
        ${meetingLink ? `<a href="${meetingLink}" style="display:inline-block;background:#0d9488;color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;">Join Session</a>` : ""}
      </div>
    `,
  });
}

export async function sendPaymentConfirmationEmail(
  email: string, name: string, amount: number, counsellorName: string
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Payment confirmed — Manokalpa",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8f7ff;border-radius:16px;">
        <h2 style="color:#1e1b4b;margin-bottom:8px;">Payment Confirmed</h2>
        <p style="color:#475569;margin-bottom:16px;">Hi ${name}, your payment of <strong>₹${Math.round(amount / 100)}</strong> for your session with ${counsellorName} has been verified.</p>
        <p style="color:#475569;">Your appointment is now confirmed. You will receive meeting details shortly.</p>
      </div>
    `,
  });
}
