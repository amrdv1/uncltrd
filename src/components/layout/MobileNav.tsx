import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MobileNavClient } from "./MobileNavClient";

export async function MobileNav() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  
  let dbUser = null;
  if (isLoggedIn) {
    dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, image: true, role: true }
    });
  }

  const userRole = dbUser?.role || session?.user?.role;
  const userName = dbUser?.name || session?.user?.name;
  const userImage = dbUser?.image || session?.user?.image;

  return (
    <MobileNavClient 
      userRole={userRole} 
      userName={userName} 
      userImage={userImage} 
      isLoggedIn={isLoggedIn} 
    />
  );
}
