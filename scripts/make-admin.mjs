// Usage: npm run make-admin -- you@example.com   (add --remove to revoke)
import { PrismaClient } from "@prisma/client";

const email = process.argv[2]?.trim().toLowerCase();
const remove = process.argv.includes("--remove");
if (!email || !email.includes("@")) {
  console.error("Usage: npm run make-admin -- you@example.com [--remove]");
  process.exit(1);
}
const db = new PrismaClient();
const user = await db.user.findUnique({ where: { email } });
if (!user) {
  console.error(`No account for ${email}. Sign up on the site first, then run this again.`);
  process.exit(1);
}
await db.user.update({ where: { email }, data: { isAdmin: !remove } });
console.log(remove ? `${email} is no longer an admin.` : `${email} is now an admin. Open /admin.`);
await db.$disconnect();
