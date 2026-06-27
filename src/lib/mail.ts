import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_testing");

// Domain setup - usually you would use a verified domain like noreply@uncultured.media
// For resend testing without a domain, you can use onboarding@resend.dev but it only sends to the verified email
const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n\n---------------------------------`);
    console.log(`🔒 2FA TOKEN FOR ${email}: ${token}`);
    console.log(`---------------------------------\n\n`);
    return;
  }

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: "Ваш код для двофакторної автентифікації",
    html: `<p>Ваш код 2FA: <strong>${token}</strong></p>`
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-password?token=${token}`;

  if (!process.env.RESEND_API_KEY) {
    console.log(`\n\n---------------------------------`);
    console.log(`🔑 PASSWORD RESET FOR ${email}:`);
    console.log(`${resetLink}`);
    console.log(`---------------------------------\n\n`);
    return;
  }

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: "Скидання пароля",
    html: `<p>Натисніть <a href="${resetLink}">тут</a> щоб скинути пароль.</p>`
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${token}`;

  if (!process.env.RESEND_API_KEY) {
    console.log(`\n\n---------------------------------`);
    console.log(`📧 EMAIL VERIFICATION FOR ${email}:`);
    console.log(`${confirmLink}`);
    console.log(`---------------------------------\n\n`);
    return;
  }

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: "Підтвердіть вашу електронну пошту",
    html: `<p>Натисніть <a href="${confirmLink}">тут</a> щоб підтвердити пошту.</p>`
  });
};
