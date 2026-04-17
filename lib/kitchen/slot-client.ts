// Client-side mirror of server's currentDeliverySlot so the OTP form can
// submit the correct slot without an extra round-trip.
export function currentDeliverySlotClient(): "today_lunch" | "today_dinner" {
  const now = new Date();
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istMinutes = (utcMinutes + 330) % (24 * 60);
  const istHour = istMinutes / 60;
  return istHour < 11.5 ? "today_lunch" : "today_dinner";
}
