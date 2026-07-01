import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import GoogleProvider from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email as string
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as string,
        } as any
      }
    }),
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: {
        initData: { label: "Init Data", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.initData) return null;

        const initDataString = credentials.initData as string;
        const initData = new URLSearchParams(initDataString);
        const hash = initData.get("hash");
        
        if (!hash) return null;
        
        initData.delete("hash");

        const dataToCheck = [...initData.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => `${key}=${value}`)
          .join("\n");

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
          console.error("TELEGRAM_BOT_TOKEN is not defined");
          return null;
        }

        const encoder = new TextEncoder();
        
        const key1 = await crypto.subtle.importKey(
          'raw',
          encoder.encode('WebAppData'),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const secretKey = await crypto.subtle.sign('HMAC', key1, encoder.encode(botToken));

        const key2 = await crypto.subtle.importKey(
          'raw',
          secretKey,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const calculatedHashBuffer = await crypto.subtle.sign('HMAC', key2, encoder.encode(dataToCheck));
        const calculatedHashArray = Array.from(new Uint8Array(calculatedHashBuffer));
        const calculatedHashHex = calculatedHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (hash !== calculatedHashHex) {
          console.error("Telegram hash validation failed");
          return null;
        }

        const userStr = initData.get("user");
        if (!userStr) return null;

        const tgUser = JSON.parse(userStr);
        const tgId = tgUser.id.toString();
        const tgEmail = `tg_${tgId}@t.me`;

        // Check if this Telegram ID is in the admin list
        // You can add IDs here as strings, e.g., ["123456789", "987654321"]
        // Or pass them via environment variable TELEGRAM_ADMIN_IDS="123456,78910"
        const envAdminIds = process.env.TELEGRAM_ADMIN_IDS ? process.env.TELEGRAM_ADMIN_IDS.split(',') : [];
        const hardcodedAdminIds: string[] = []; // I will add user IDs here later
        const isAdmin = envAdminIds.includes(tgId) || hardcodedAdminIds.includes(tgId);

        let user = await db.user.findUnique({
          where: { email: tgEmail }
        });

        if (!user) {
          user = await db.user.create({
            data: {
              email: tgEmail,
              name: tgUser.first_name + (tgUser.last_name ? ` ${tgUser.last_name}` : ""),
              emailVerified: new Date(),
              image: tgUser.photo_url || null,
              role: isAdmin ? "ADMIN" : "USER"
            }
          });
        } else {
          // Update photo if changed, or upgrade to ADMIN if added to the list later
          const updateData: any = {};
          if (tgUser.photo_url && user.image !== tgUser.photo_url) {
            updateData.image = tgUser.photo_url;
          }
          if (isAdmin && user.role !== "ADMIN") {
            updateData.role = "ADMIN";
          }
          
          if (Object.keys(updateData).length > 0) {
            user = await db.user.update({
              where: { id: user.id },
              data: updateData
            });
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth and Telegram without email verification
      if (account?.provider !== "credentials" && account?.provider !== "telegram") return true;

      const existingUser = await db.user.findUnique({
        where: { id: user.id }
      });

      if (!existingUser) return false;

      // Prevent sign in without email verification
      if (!existingUser.emailVerified) {
        return false;
      }

      // Check 2FA
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await db.twoFactorConfirmation.findUnique({
          where: { userId: existingUser.id }
        });

        if (!twoFactorConfirmation) return false;

        // Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id }
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.isTwoFactorEnabled = (user as any).isTwoFactorEnabled;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        (session.user as any).isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
})
