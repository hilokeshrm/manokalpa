import { db } from "@/lib/db";

// Shared helper: confirm appointment + create Earning when a payment is verified
// Used by admin, counsellor, and supervisor payment verification routes
export async function verifyPaymentEffects(appointmentId: string, amount: number) {
  await db.appointment.update({
    where: { id: appointmentId },
    data: { status: "CONFIRMED" },
  });

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: { counsellor: { include: { counsellor: true } } },
  });

  if (appointment?.counsellor?.counsellor) {
    const existing = await db.earning.findUnique({ where: { appointmentId } });
    if (!existing) {
      const counsellorShare = Math.round(amount * 0.70);
      const platformShare   = amount - counsellorShare;
      const tds             = Math.round(counsellorShare * 0.10);

      await db.earning.create({
        data: {
          counsellorId:   appointment.counsellor.counsellor.id,
          appointmentId,
          totalAmount:    amount,
          counsellorShare,
          platformShare,
          tdsDeduction:   tds,
          netPayable:     counsellorShare - tds,
        },
      });
    }
  }
}
