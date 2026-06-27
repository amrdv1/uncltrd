"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleLike(articleId: string, isLike: boolean) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existingLike = await db.like.findUnique({
    where: {
      userId_articleId: {
        userId: session.user.id,
        articleId,
      }
    }
  });

  if (existingLike) {
    if (existingLike.isLike === isLike) {
      // Toggle off if clicking the same button
      await db.like.delete({ where: { id: existingLike.id } });
    } else {
      // Switch vote
      await db.like.update({
        where: { id: existingLike.id },
        data: { isLike }
      });
    }
  } else {
    // New vote
    await db.like.create({
      data: {
        userId: session.user.id,
        articleId,
        isLike
      }
    });
  }

  const article = await db.article.findUnique({ where: { id: articleId } });
  if (article) {
    revalidatePath(`/article/${article.slug}`);
  }
}

export async function submitComment(articleId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const content = formData.get("content") as string;
  if (!content || !content.trim()) return;

  await db.comment.create({
    data: {
      content: content.trim(),
      userId: session.user.id,
      articleId,
    }
  });

  const article = await db.article.findUnique({ where: { id: articleId } });
  if (article) {
    revalidatePath(`/article/${article.slug}`);
  }
}

export async function submitTrackRating(articleId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const text = parseInt(formData.get("text") as string);
  const beats = parseInt(formData.get("beats") as string);
  const sound = parseInt(formData.get("sound") as string);
  const vibe = parseInt(formData.get("vibe") as string);
  const charisma = parseInt(formData.get("charisma") as string);
  const content = formData.get("content") as string || null;

  if (!content || !content.trim()) {
    throw new Error("Text comment is required to leave a rating.");
  }

  await db.userRating.upsert({
    where: {
      userId_articleId: {
        userId: session.user.id,
        articleId,
      }
    },
    create: {
      userId: session.user.id,
      articleId,
      text, beats, sound, vibe, charisma, content
    },
    update: {
      text, beats, sound, vibe, charisma, content
    }
  });

  const publicRatings = await db.userRating.findMany({ 
    where: { articleId, user: { role: { not: "ADMIN" } } }
  });
  
  if (publicRatings.length > 0) {
    const avg = (field: keyof typeof publicRatings[0]) => 
      publicRatings.reduce((sum, r) => sum + ((r[field] as number) || 0), 0) / publicRatings.length;

    const scoreText = avg('text');
    const scoreBeats = avg('beats');
    const scoreSound = avg('sound');
    const scoreVibe = avg('vibe');
    const scoreCharisma = avg('charisma');
    
    // Total is calculated assuming max 50. 10+10+10+10+10 = 50
    const totalScore = Math.round(scoreText + scoreBeats + scoreSound + scoreVibe + scoreCharisma);

    await db.trackReview.update({
      where: { articleId },
      data: { scoreText, scoreBeats, scoreSound, scoreVibe, scoreCharisma, totalScore }
    });
  }

  const article = await db.article.findUnique({ where: { id: articleId } });
  if (article) {
    revalidatePath(`/article/${article.slug}`);
    revalidatePath(`/category/reviews`);
  }
}
