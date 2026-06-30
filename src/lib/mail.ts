import nodemailer from "nodemailer";

const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD,
  },
});

const sendEmailNodemailer = async (to: string, subject: string, html: string) => {
  if (!SMTP_EMAIL || !SMTP_PASSWORD) {
    console.log(`\n\n---------------------------------`);
    console.log(`📧 EMAIL TO ${to}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html}`);
    console.log(`---------------------------------\n\n`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Uncultured" <${SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email via Zoho SMTP:", error);
  }
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await sendEmailNodemailer(
    email,
    "Ваш код для двофакторної автентифікації",
    `<p>Ваш код 2FA: <strong>${token}</strong></p>`
  );
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-password?token=${token}`;
  await sendEmailNodemailer(
    email,
    "Скидання пароля",
    `<p>Натисніть <a href="${resetLink}">тут</a> щоб скинути пароль.</p>`
  );
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/new-verification?token=${token}`;
  await sendEmailNodemailer(
    email,
    "Підтвердіть вашу електронну пошту",
    `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; text-align: center; padding: 40px 20px;">
      <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -1px; margin-bottom: 20px;">UNCULTURED.</h1>
      <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
        Дякуємо за реєстрацію! Щоб активувати ваш акаунт, будь ласка, підтвердіть свою пошту.
      </p>
      <a href="${confirmLink}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
        Підтвердити Email
      </a>
      <p style="font-size: 12px; color: #999; margin-top: 40px;">
        Якщо ви не реєструвались на сайті Uncultured, просто проігноруйте цей лист.
      </p>
    </div>
    `
  );
};
