"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { generateVerificationToken, generateTwoFactorToken, generatePasswordResetToken } from "@/lib/tokens";
import { sendVerificationEmail, sendTwoFactorTokenEmail, sendPasswordResetEmail } from "@/lib/mail";

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Всі поля обов'язкові" };
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return { error: "Пароль має містити мінімум 8 символів, велику букву, цифру та спеціальний символ" };
  }

  const existingUser = await db.user.findFirst({
    where: { 
      OR: [
        { email },
        { name: { equals: name } }
      ]
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return { error: "Цей email використовується на іншому акаунті" };
    } else {
      return { error: "Цей нікнейм вже зайнятий, спробуйте інший" };
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { redirectUrl: "/login?success=Акаунт+успішно+створено,+перевірте+пошту+для+підтвердження!" };
}

export async function login(formData: FormData, code?: string) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Всі поля обов'язкові" };
  }

  const existingUser = await db.user.findUnique({
    where: { email }
  });

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Неправильний email або пароль" };
  }

  // Check if email is verified
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(existingUser.email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);
    return { success: "Лист для підтвердження надіслано на вашу пошту!" };
  }

  // Two Factor Authentication
  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await db.twoFactorToken.findFirst({
        where: { email: existingUser.email }
      });

      if (!twoFactorToken || twoFactorToken.token !== code) {
        return { error: "Неправильний код" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) {
        return { error: "Термін дії коду вичерпано" };
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id }
      });

      const existingConfirmation = await db.twoFactorConfirmation.findUnique({
        where: { userId: existingUser.id }
      });

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id }
        });
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id
        }
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);
      return { twoFactor: true };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: "Успішний вхід!", redirectUrl: "/" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Неправильний email або пароль" };
        default:
          return { error: "Щось пішло не так" };
      }
    }
    throw error;
  }
}


export async function newVerification(token: string) {
  const existingToken = await db.verificationToken.findUnique({
    where: { token }
  });

  if (!existingToken) {
    return { error: "Токен не знайдено!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Термін дії токена минув!" };
  }

  const existingUser = await db.user.findUnique({
    where: { email: existingToken.email }
  });

  if (!existingUser) {
    return { error: "Користувача не знайдено!" };
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: { 
      emailVerified: new Date(),
      email: existingToken.email
    }
  });

  await db.verificationToken.delete({
    where: { id: existingToken.id }
  });

  return { success: "Електронну пошту підтверджено!" };
}

export async function loginWithGoogle() {
  await signIn("google");
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email обов'язковий" };
  }

  const existingUser = await db.user.findUnique({
    where: { email }
  });

  if (!existingUser) {
    // Return success anyway to prevent email enumeration
    return { success: "Лист з інструкціями відправлено!" };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

  return { success: "Лист з інструкціями відправлено!" };
}

export async function setNewPassword(formData: FormData, token: string | null) {
  if (!token) {
    return { error: "Відсутній токен!" };
  }

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { error: "Всі поля обов'язкові" };
  }

  if (password !== confirmPassword) {
    return { error: "Паролі не співпадають" };
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return { error: "Пароль має містити мінімум 8 символів, велику букву, цифру та спеціальний символ" };
  }

  const existingToken = await db.passwordResetToken.findUnique({
    where: { token }
  });

  if (!existingToken) {
    return { error: "Недійсний токен!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Термін дії токена минув!" };
  }

  const existingUser = await db.user.findUnique({
    where: { email: existingToken.email }
  });

  if (!existingUser) {
    return { error: "Користувача не знайдено!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword }
  });

  await db.passwordResetToken.delete({
    where: { id: existingToken.id }
  });

  return { success: "Пароль успішно оновлено!", redirectUrl: "/login" };
}
