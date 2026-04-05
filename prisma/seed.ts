import { PrismaClient, Role, SessionType, ContentType, ContentStatus, EventType, EventStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Super Admin (Lokesh)
  const superAdminPassword = await bcrypt.hash("Loki@2026", 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: "hi.lokeshrm@gmail.com" },
    update: {},
    create: {
      name: "Lokesh R M",
      mobile: "+919000000000",
      email: "hi.lokeshrm@gmail.com",
      password: superAdminPassword,
      role: Role.ADMIN,
      emailVerified: true,
      mobileVerified: true,
    },
  });
  console.log("✅ Super Admin created:", superAdmin.email);

  // Admin user
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@manokalpa.in" },
    update: {},
    create: {
      name: "Manokalpa Admin",
      mobile: "+919000000001",
      email: "admin@manokalpa.in",
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: true,
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Demo user
  const userPassword = await bcrypt.hash("User@123", 12);
  const user = await prisma.user.upsert({
    where: { email: "priya@example.com" },
    update: {},
    create: {
      name: "Priya Mehta",
      mobile: "+919876543210",
      email: "priya@example.com",
      password: userPassword,
      role: Role.USER,
      emailVerified: true,
      profile: {
        create: {
          gender: "FEMALE",
          city: "Bengaluru",
          state: "Karnataka",
          qualification: "MBA",
          designation: "Product Manager",
        },
      },
    },
  });
  console.log("✅ Demo user created:", user.email);

  // Assessments
  const assessments = [
    {
      title: "PHQ-9: Depression Screening",
      description: "Patient Health Questionnaire — validated 9-item depression screening tool.",
      category: "Depression",
      duration: 5,
      questions: [
        { text: "Little interest or pleasure in doing things?", type: "SCALE", order: 1 },
        { text: "Feeling down, depressed, or hopeless?", type: "SCALE", order: 2 },
        { text: "Trouble falling or staying asleep, or sleeping too much?", type: "SCALE", order: 3 },
        { text: "Feeling tired or having little energy?", type: "SCALE", order: 4 },
        { text: "Poor appetite or overeating?", type: "SCALE", order: 5 },
        { text: "Feeling bad about yourself — or that you are a failure?", type: "SCALE", order: 6 },
        { text: "Trouble concentrating on things such as reading or watching TV?", type: "SCALE", order: 7 },
        { text: "Moving or speaking slowly? Or the opposite — being fidgety or restless?", type: "SCALE", order: 8 },
        { text: "Thoughts that you would be better off dead or of hurting yourself?", type: "SCALE", order: 9 },
      ],
    },
    {
      title: "GAD-7: Anxiety Assessment",
      description: "Generalised Anxiety Disorder 7-item scale.",
      category: "Anxiety",
      duration: 3,
      questions: [
        { text: "Feeling nervous, anxious, or on edge?", type: "SCALE", order: 1 },
        { text: "Not being able to stop or control worrying?", type: "SCALE", order: 2 },
        { text: "Worrying too much about different things?", type: "SCALE", order: 3 },
        { text: "Trouble relaxing?", type: "SCALE", order: 4 },
        { text: "Being so restless that it is hard to sit still?", type: "SCALE", order: 5 },
        { text: "Becoming easily annoyed or irritable?", type: "SCALE", order: 6 },
        { text: "Feeling afraid as if something awful might happen?", type: "SCALE", order: 7 },
      ],
    },
    {
      title: "WHO-5: Wellbeing Index",
      description: "World Health Organisation 5-item Well-Being Index.",
      category: "Wellbeing",
      duration: 2,
      questions: [
        { text: "I have felt cheerful and in good spirits.", type: "SCALE", order: 1 },
        { text: "I have felt calm and relaxed.", type: "SCALE", order: 2 },
        { text: "I have felt active and vigorous.", type: "SCALE", order: 3 },
        { text: "I woke up feeling fresh and rested.", type: "SCALE", order: 4 },
        { text: "My daily life has been filled with things that interest me.", type: "SCALE", order: 5 },
      ],
    },
  ];

  for (const a of assessments) {
    const created = await prisma.assessment.upsert({
      where: { id: a.title.slice(0, 5) },
      update: {},
      create: {
        id: a.title.slice(0, 5),
        title: a.title,
        description: a.description,
        category: a.category,
        duration: a.duration,
        questions: {
          create: a.questions,
        },
      },
    });
    console.log("✅ Assessment created:", created.title);
  }

  // Sample events
  const sampleEvents = [
    {
      title: "Managing Anxiety in the Workplace",
      description: "Join us for an interactive webinar on recognising and managing workplace anxiety.",
      type: EventType.ONLINE,
      status: EventStatus.UPCOMING,
      date: new Date("2026-03-28T18:00:00+05:30"),
      youtubeLink: "https://youtube.com/live/example",
      capacity: 100,
      price: 0,
      category: "Mental Health",
      tags: ["anxiety", "workplace", "webinar"],
    },
    {
      title: "Mindfulness & Stress Reduction Workshop",
      description: "An in-person workshop combining guided meditation, yoga, and stress management techniques.",
      type: EventType.OFFLINE,
      status: EventStatus.UPCOMING,
      date: new Date("2026-04-05T10:00:00+05:30"),
      venue: "Bengaluru Wellness Centre, Indiranagar",
      capacity: 25,
      price: 50000, // ₹500 in paise
      category: "Wellness",
      tags: ["mindfulness", "yoga", "stress"],
    },
  ];

  for (const e of sampleEvents) {
    await prisma.event.create({ data: e });
    console.log("✅ Event created:", e.title);
  }

  // Subscription plans
  const plans = [
    { name: "Just Listen — 5 Sessions", sessions: 5, price: 200000, discount: 20, sessionType: SessionType.JUST_LISTEN },
    { name: "Just Listen — 10 Sessions", sessions: 10, price: 350000, discount: 30, sessionType: SessionType.JUST_LISTEN },
    { name: "Individual Therapy — 5 Sessions", sessions: 5, price: 480000, discount: 20, sessionType: SessionType.INDIVIDUAL },
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.create({ data: p });
    console.log("✅ Plan created:", p.name);
  }

  console.log("\n🎉 Seeding complete!");
  console.log("   Admin: admin@manokalpa.in / Admin@123");
  console.log("   User:  priya@example.com / User@123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
