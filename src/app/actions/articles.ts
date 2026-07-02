"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatImageUrl } from "@/lib/utils";

export async function createArticle(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    throw new Error("Unauthorized");
  }

  const isReview = formData.get("isTrackReview") === "on" || formData.get("isTrackReview") === "true";
  
  let title = formData.get("title") as string;
  
  if (isReview) {
    const artistName = formData.get("artistName") as string || "";
    const trackName = formData.get("trackName") as string || "";
    if (artistName && trackName) {
      title = `${artistName} - ${trackName}`;
    }
  }

  const content = formData.get("content") as string;

  let categoryId = formData.get("categoryId") as string;
  
  if (isReview && !categoryId) {
    const reviewCategory = await db.category.findFirst({
      where: { OR: [{ slug: "reviews" }, { slug: "review" }] }
    });
    if (reviewCategory) categoryId = reviewCategory.id;
  }

  // Generate slug supporting Cyrillic/Unicode: replace spaces with -, remove invalid chars, trim dashes
  let baseSlug = title.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^\p{L}\p{N}-]+/gu, "").replace(/(^-|-$)+/g, "");
  
  // Fallback if slug is completely empty (e.g., weird symbols)
  if (!baseSlug) baseSlug = Date.now().toString();

  let slug = baseSlug;
  let slugCounter = 0;
  while (true) {
    const existing = await db.article.findUnique({ where: { slug } });
    if (!existing) break;
    slugCounter++;
    slug = `${baseSlug}-${slugCounter}`;
  }

  const mediaFilesJson = formData.get("mediaFiles") as string;
  let mediaFiles: any[] = [];
  try {
    if (mediaFilesJson) mediaFiles = JSON.parse(mediaFilesJson);
  } catch (e) {
    console.error("Failed to parse mediaFiles", e);
  }

  const listenUrl = formData.get("listenUrl") as string;
  const appleUrl = formData.get("appleUrl") as string;
  const youtubeUrl = formData.get("youtubeUrl") as string;
  
  if (youtubeUrl) mediaFiles.unshift({ type: "AUDIO", url: youtubeUrl });
  if (appleUrl) mediaFiles.unshift({ type: "AUDIO", url: appleUrl });
  if (listenUrl) {
    mediaFiles.unshift({ type: "AUDIO", url: listenUrl });
  }

  let imageUrl = formData.get("imageUrl") as string | null;
  imageUrl = formatImageUrl(imageUrl);

  await db.article.create({
    data: {
      title,
      slug,
      content,
      imageUrl: imageUrl || null,
      categoryId: categoryId || null,
      authorId: session.user.id,
      status: "PUBLISHED",
      isTrackReview: isReview,
      media: mediaFiles.length > 0 ? {
        create: mediaFiles.map((m: any) => ({ url: formatImageUrl(m.url) as string, type: m.type }))
      } : undefined,
      // @ts-ignore
      trackReview: isReview ? {
        create: {
          artistName: formData.get("artistName") as string || "",
          trackName: formData.get("trackName") as string || "",
          coverUrl: formatImageUrl(formData.get("coverUrl") as string) || null,
          releaseType: formData.get("releaseType") as string || "SINGLE",
          releaseDate: formData.get("releaseDate") ? new Date(formData.get("releaseDate") as string) : new Date(),
          adminText: parseInt(formData.get("adminText") as string) || 0,
          adminBeats: parseInt(formData.get("adminBeats") as string) || 0,
          adminSound: parseInt(formData.get("adminSound") as string) || 0,
          adminVibe: parseInt(formData.get("adminVibe") as string) || 0,
          adminCharisma: parseInt(formData.get("adminCharisma") as string) || 0,
          adminTotal: (parseInt(formData.get("adminText") as string) || 0) + 
                      (parseInt(formData.get("adminBeats") as string) || 0) + 
                      (parseInt(formData.get("adminSound") as string) || 0) + 
                      (parseInt(formData.get("adminVibe") as string) || 0) + 
                      (parseInt(formData.get("adminCharisma") as string) || 0)
        } as any
      } : undefined,
    },
  });

  revalidatePath("/admin-panel/articles");
  revalidatePath("/");
  if (categoryId) {
    const cat = await db.category.findUnique({ where: { id: categoryId } });
    if (cat) revalidatePath(`/category/${cat.slug}`);
  }
  
  redirect(`/article/${encodeURIComponent(slug)}`);
}

export async function updateArticle(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const article = await db.article.findUnique({
    where: { id },
    include: { allowedEditors: true }
  });

  if (!article) throw new Error("Not found");

  // Permission check
  const isAuthor = article.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  const isAllowedEditor = article.allowedEditors.some(e => e.id === session.user.id);

  if (!isAuthor && !isAdmin && !isAllowedEditor) {
    throw new Error("You do not have permission to edit this article");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = formData.get("categoryId") as string;

  const mediaFilesJson = formData.get("mediaFiles") as string;
  let mediaFiles: any[] = [];
  try {
    if (mediaFilesJson) mediaFiles = JSON.parse(mediaFilesJson);
  } catch (e) {
    console.error("Failed to parse mediaFiles", e);
  }

  const listenUrl = formData.get("listenUrl") as string;
  const appleUrl = formData.get("appleUrl") as string;
  const youtubeUrl = formData.get("youtubeUrl") as string;
  
  // Need to clear existing AUDIO/VIDEO media first to avoid duplicates since we replace them
  mediaFiles = mediaFiles.filter(m => m.type === "IMAGE");
  
  if (youtubeUrl) mediaFiles.unshift({ type: "AUDIO", url: youtubeUrl });
  if (appleUrl) mediaFiles.unshift({ type: "AUDIO", url: appleUrl });
  if (listenUrl) {
    mediaFiles.unshift({ type: "AUDIO", url: listenUrl });
  }

  let imageUrl = formData.get("imageUrl") as string | null;
  imageUrl = formatImageUrl(imageUrl);

  const isReview = formData.get("isTrackReview") === "on" || formData.get("isTrackReview") === "true";

  let finalCategoryId = categoryId || null;
  if (isReview && !finalCategoryId) {
    const reviewCategory = await db.category.findFirst({
      where: { OR: [{ slug: "reviews" }, { slug: "review" }] }
    });
    if (reviewCategory) finalCategoryId = reviewCategory.id;
  }

  await db.article.update({
    where: { id },
    data: {
      title,
      content,
      imageUrl: imageUrl || null,
      categoryId: finalCategoryId,
      isTrackReview: isReview,
      media: {
        deleteMany: {}, // Clear old media
        create: mediaFiles.map((m: any) => ({ url: formatImageUrl(m.url) as string, type: m.type }))
      },
    },
  });

  if (isReview) {
    // @ts-ignore
    await db.trackReview.upsert({
      where: { articleId: id },
      create: {
        articleId: id,
        artistName: formData.get("artistName") as string || "",
        trackName: formData.get("trackName") as string || "",
        coverUrl: formatImageUrl(formData.get("coverUrl") as string) || null,
        adminText: parseInt(formData.get("adminText") as string) || 0,
        adminBeats: parseInt(formData.get("adminBeats") as string) || 0,
        adminSound: parseInt(formData.get("adminSound") as string) || 0,
        adminVibe: parseInt(formData.get("adminVibe") as string) || 0,
        adminCharisma: parseInt(formData.get("adminCharisma") as string) || 0,
        adminTotal: (parseInt(formData.get("adminText") as string) || 0) + 
                    (parseInt(formData.get("adminBeats") as string) || 0) + 
                    (parseInt(formData.get("adminSound") as string) || 0) + 
                    (parseInt(formData.get("adminVibe") as string) || 0) + 
                    (parseInt(formData.get("adminCharisma") as string) || 0)
      } as any,
      update: {
        // @ts-ignore
        artistName: formData.get("artistName") as string || "",
        trackName: formData.get("trackName") as string || "",
        coverUrl: formatImageUrl(formData.get("coverUrl") as string) || null,
        releaseType: formData.get("releaseType") as string || "SINGLE",
        releaseDate: formData.get("releaseDate") ? new Date(formData.get("releaseDate") as string) : new Date(),
        adminText: parseInt(formData.get("adminText") as string) || 0,
        adminBeats: parseInt(formData.get("adminBeats") as string) || 0,
        adminSound: parseInt(formData.get("adminSound") as string) || 0,
        adminVibe: parseInt(formData.get("adminVibe") as string) || 0,
        adminCharisma: parseInt(formData.get("adminCharisma") as string) || 0,
        adminTotal: (parseInt(formData.get("adminText") as string) || 0) + 
                    (parseInt(formData.get("adminBeats") as string) || 0) + 
                    (parseInt(formData.get("adminSound") as string) || 0) + 
                    (parseInt(formData.get("adminVibe") as string) || 0) + 
                    (parseInt(formData.get("adminCharisma") as string) || 0)
      } as any
    });
  } else {
    await db.trackReview.deleteMany({ where: { articleId: id } });
  }

  revalidatePath("/admin-panel/articles");
  revalidatePath("/");
  revalidatePath(`/article/${encodeURIComponent(article.slug)}`);
  if (categoryId || article.categoryId) {
    const catId = categoryId || article.categoryId;
    const cat = await db.category.findUnique({ where: { id: catId as string } });
    if (cat) revalidatePath(`/category/${cat.slug}`);
  }

  redirect(`/article/${encodeURIComponent(article.slug)}`);
}

export async function deleteArticle(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const article = await db.article.findUnique({ where: { id } });
  if (!article) return;

  const isAuthor = article.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    throw new Error("Unauthorized to delete");
  }

  await db.article.delete({ where: { id } });

  revalidatePath("/admin-panel/articles");
  revalidatePath("/");
}

export async function togglePinArticle(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const article = await db.article.findUnique({
    where: { id },
    include: { allowedEditors: true }
  });

  if (!article) throw new Error("Not found");

  const isAuthor = article.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  const isAllowedEditor = article.allowedEditors.some(e => e.id === session.user.id);

  if (!isAuthor && !isAdmin && !isAllowedEditor) {
    throw new Error("You do not have permission to pin this article");
  }

  await db.article.update({
    where: { id },
    data: {
      isPinned: !article.isPinned
    }
  });

  revalidatePath("/admin-panel/articles");
  revalidatePath("/");
}

export async function grantEditPermission(articleId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const editorEmail = formData.get("editorEmail") as string;
  if (!editorEmail) throw new Error("Email is required");

  const article = await db.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error("Article not found");

  const isAuthor = article.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    throw new Error("Only the author or admin can grant permissions");
  }

  const editor = await db.user.findUnique({ where: { email: editorEmail } });
  if (!editor || (editor.role !== "EDITOR" && editor.role !== "ADMIN")) {
    throw new Error("User not found or is not an editor");
  }

  await db.article.update({
    where: { id: articleId },
    data: {
      allowedEditors: {
        connect: { id: editor.id }
      }
    }
  });

  revalidatePath(`/admin-panel/articles/${articleId}`);
}

export async function resetAdminRatings(articleId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const article = await db.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error("Article not found");

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin) {
    throw new Error("Only admins can reset editorial ratings");
  }

  // Delete all UserRatings for this article where the user is an ADMIN
  const adminUsers = await db.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true }
  });
  
  const adminIds = adminUsers.map(u => u.id);

  if (adminIds.length > 0) {
    await db.userRating.deleteMany({
      where: {
        articleId,
        userId: { in: adminIds }
      }
    });
  }

  // Reset the legacy hardcoded admin scores in TrackReview to 0
  await db.trackReview.update({
    where: { articleId },
    data: {
      adminText: 0,
      adminBeats: 0,
      adminSound: 0,
      adminVibe: 0,
      adminCharisma: 0,
      adminTotal: 0
    }
  });

  revalidatePath(`/article/${article.slug}`);
  revalidatePath(`/admin-panel/articles/${articleId}`);
}
