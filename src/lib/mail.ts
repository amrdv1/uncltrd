const UNIONE_API_KEY = process.env.UNIONE_API_KEY || "66zm4npearqngw48q9u1rbw88di353m6mokmb1wy";
const FROM_EMAIL = process.env.EMAIL_FROM || "info@uncultured.media"; // UniOne requires verified sender

const sendEmailUniOne = async (to: string, subject: string, html: string) => {
  if (!UNIONE_API_KEY) {
    console.log(`\n\n---------------------------------`);
    console.log(`📧 EMAIL TO ${to}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html}`);
    console.log(`---------------------------------\n\n`);
    return;
  }

  const url = 'https://eu1.unione.io/en/transactional/api/v1/email/send.json';
  
  const data = {
    message: {
      recipients: [{ email: to }],
      body: { html },
      subject: subject,
      from_email: FROM_EMAIL,
      from_name: "Uncultured"
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': UNIONE_API_KEY
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.status !== 'success') {
      console.error("UniOne Email Error:", result);
    }
  } catch (error) {
    console.error("Failed to send email via UniOne:", error);
  }
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await sendEmailUniOne(
    email,
    "Ваш код для двофакторної автентифікації",
    `<p>Ваш код 2FA: <strong>${token}</strong></p>`
  );
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-password?token=${token}`;
  await sendEmailUniOne(
    email,
    "Скидання пароля",
    `<p>Натисніть <a href="${resetLink}">тут</a> щоб скинути пароль.</p>`
  );
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/new-verification?token=${token}`;
  await sendEmailUniOne(
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
