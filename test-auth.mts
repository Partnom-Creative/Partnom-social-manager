import { PrismaClient } from "./src/generated/prisma/client.js";
import { PrismaPg } from '@prisma/adapter-pg';
import { hash, compare } from 'bcryptjs';
import { normalizePgConnectionString } from "./src/lib/normalize-pg-connection-string";

const adapter = new PrismaPg({
  connectionString: normalizePgConnectionString(process.env.DATABASE_URL ?? ""),
});
const db = new PrismaClient({ adapter });

async function main() {
  const users = await db.user.findMany({
    select: { id: true, email: true, name: true, role: true, hashedPassword: true }
  });
  console.log("Users in database:", users.length);
  for (const u of users) {
    console.log(`  - ${u.email} (${u.role}) hasPassword: ${!!u.hashedPassword}`);
    if (u.hashedPassword) {
      const testValid = await compare("test1234", u.hashedPassword);
      console.log(`    password "test1234" valid: ${testValid}`);
    }
  }
  
  const testEmail = "debug-test@test.com";
  const existing = await db.user.findUnique({ where: { email: testEmail } });
  if (!existing) {
    const hashed = await hash("testpass123", 12);
    await db.organization.create({
      data: {
        name: "Debug Org",
        slug: "debug-org-" + Date.now().toString(36),
        users: { create: { name: "Debug User", email: testEmail, hashedPassword: hashed, role: "ADMIN" } }
      }
    });
    console.log("\nCreated test user:", testEmail, "password: testpass123");
    
    const found = await db.user.findUnique({ where: { email: testEmail } });
    console.log("Found after create:", !!found);
    if (found?.hashedPassword) {
      const valid = await compare("testpass123", found.hashedPassword);
      console.log("Password valid:", valid);
    }
  } else {
    console.log("\nTest user exists:", testEmail);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
