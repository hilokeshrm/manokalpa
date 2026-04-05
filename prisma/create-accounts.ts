/**
 * One-time script: creates test accounts for COUNSELLOR and SUPERVISOR roles.
 * Run with: npx ts-node --project tsconfig.seed.json prisma/create-accounts.ts
 */
import { PrismaClient, Role, SessionType, CounsellorLevel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Creating missing role accounts...\n");

  // ── SUPERVISOR ────────────────────────────────────────────────────────────
  const supPassword = await bcrypt.hash("Supervisor@123", 12);
  const supervisor = await prisma.user.upsert({
    where: { email: "supervisor@manokalpa.in" },
    update: {},
    create: {
      name: "Ananya Krishnan",
      mobile: "+919000000002",
      email: "supervisor@manokalpa.in",
      password: supPassword,
      role: Role.SUPERVISOR,
      emailVerified: true,
      mobileVerified: true,
    },
  });
  console.log("✅ SUPERVISOR created:", supervisor.email);

  // ── COUNSELLOR ────────────────────────────────────────────────────────────
  const counsellorPassword = await bcrypt.hash("Counsellor@123", 12);
  const counsellorUser = await prisma.user.upsert({
    where: { email: "counsellor@manokalpa.in" },
    update: {},
    create: {
      name: "Dr. Ravi Sharma",
      mobile: "+919000000003",
      email: "counsellor@manokalpa.in",
      password: counsellorPassword,
      role: Role.COUNSELLOR,
      emailVerified: true,
      mobileVerified: true,
      profile: {
        create: {
          gender: "MALE",
          city: "Bengaluru",
          state: "Karnataka",
          qualification: "M.Phil Clinical Psychology",
          designation: "Senior Counsellor",
          bio: "Experienced clinical psychologist specialising in anxiety, depression and relationship counselling.",
        },
      },
    },
  });
  console.log("✅ COUNSELLOR user created:", counsellorUser.email);

  // Create counsellor profile if not already there
  const existing = await prisma.counsellor.findUnique({ where: { userId: counsellorUser.id } });
  if (!existing) {
    await prisma.counsellor.create({
      data: {
        userId: counsellorUser.id,
        expertise: ["Anxiety", "Depression", "Relationship Issues", "Stress Management"],
        qualifications: ["M.Phil Clinical Psychology", "BA Psychology"],
        certifications: ["RCI Licensed"],
        experience: 7,
        level: CounsellorLevel.SENIOR,
        rating: 4.8,
        totalRatings: 42,
        bio: "Experienced clinical psychologist specialising in anxiety, depression and relationship counselling.",
        tagline: "Helping you find clarity through every storm.",
        languages: ["English", "Hindi", "Kannada"],
        sessionTypes: [
          SessionType.JUST_LISTEN,
          SessionType.INDIVIDUAL,
          SessionType.COUPLES,
          SessionType.HOLISTIC,
        ],
        isVerified: true,
        isAvailable: true,
        consultationFee: 1200,
        // Default weekly availability: Mon–Sat 9am–6pm, 50 min slots
        availabilities: {
          create: [1, 2, 3, 4, 5, 6].map((day) => ({
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "18:00",
            slotDuration: 50,
            isActive: true,
          })),
        },
      },
    });
    console.log("✅ Counsellor profile created for:", counsellorUser.email);
  } else {
    console.log("ℹ️  Counsellor profile already exists.");
  }

  console.log("\n🎉 Done!\n");
  console.log("┌─────────────────────────────────────────────────────────┐");
  console.log("│                All Platform Accounts                    │");
  console.log("├──────────────┬──────────────────────────┬───────────────┤");
  console.log("│ Role         │ Email                    │ Password      │");
  console.log("├──────────────┼──────────────────────────┼───────────────┤");
  console.log("│ ADMIN        │ hi.lokeshrm@gmail.com    │ Loki@2026     │");
  console.log("│ ADMIN        │ admin@manokalpa.in       │ Admin@123     │");
  console.log("│ SUPERVISOR   │ supervisor@manokalpa.in  │ Supervisor@123│");
  console.log("│ COUNSELLOR   │ counsellor@manokalpa.in  │ Counsellor@123│");
  console.log("│ USER         │ priya@example.com        │ User@123      │");
  console.log("└──────────────┴──────────────────────────┴───────────────┘");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
