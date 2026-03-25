import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { normalizePgConnectionString } from "../src/lib/normalize-pg-connection-string";

dotenv.config();

const adapter = new PrismaPg({
  connectionString: normalizePgConnectionString(process.env.DATABASE_URL!),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const org = await prisma.organization.create({
    data: {
      name: "Demo Agency",
      slug: "demo-agency",
    },
  });
  console.log(`Created organization: ${org.name}`);

  const adminPassword = await bcrypt.hash("password123", 12);
  const admin = await prisma.user.create({
    data: {
      email: "admin@demo.com",
      name: "Admin User",
      hashedPassword: adminPassword,
      role: "ADMIN",
      organizationId: org.id,
    },
  });
  console.log(`Created admin: ${admin.email}`);

  const memberPassword = await bcrypt.hash("password123", 12);
  const member = await prisma.user.create({
    data: {
      email: "member@demo.com",
      name: "Team Member",
      hashedPassword: memberPassword,
      role: "MEMBER",
      organizationId: org.id,
    },
  });
  console.log(`Created member: ${member.email}`);

  const acme = await prisma.client.create({
    data: {
      name: "Acme Corp",
      slug: "acme-corp",
      color: "#6366f1",
      organizationId: org.id,
    },
  });

  const techstart = await prisma.client.create({
    data: {
      name: "TechStart",
      slug: "techstart",
      color: "#10b981",
      organizationId: org.id,
    },
  });

  const greenleaf = await prisma.client.create({
    data: {
      name: "GreenLeaf",
      slug: "greenleaf",
      color: "#22c55e",
      organizationId: org.id,
    },
  });
  console.log(`Created clients: ${acme.name}, ${techstart.name}, ${greenleaf.name}`);

  await prisma.teamAccess.create({
    data: {
      userId: member.id,
      clientId: acme.id,
      accessLevel: "VIEW",
    },
  });

  await prisma.teamAccess.create({
    data: {
      userId: member.id,
      clientId: techstart.id,
      accessLevel: "CREATE",
    },
  });
  console.log("Created team access for member");

  await prisma.post.create({
    data: {
      content:
        "Excited to announce our new product launch! Stay tuned for more details. #innovation #launch",
      status: "DRAFT",
      clientId: acme.id,
      authorId: admin.id,
    },
  });

  await prisma.post.create({
    data: {
      content:
        "We're hiring! Join our growing team and help us build the future of tech. Apply now at our careers page.",
      status: "DRAFT",
      clientId: techstart.id,
      authorId: member.id,
    },
  });
  console.log("Created sample posts");

  console.log("Seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
