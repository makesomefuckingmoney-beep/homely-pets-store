/** Delivery timeline — stages advance by time since order (demo-friendly) */
const STAGES = [
  { status: "confirmed", label: "Order confirmed", offsetHours: 0 },
  { status: "processing", label: "Preparing your order", offsetHours: 4 },
  { status: "packed", label: "Packed at our warehouse", offsetHours: 24 },
  { status: "dispatched", label: "Handed to courier", offsetHours: 48 },
  { status: "out_for_delivery", label: "Out for delivery", offsetHours: 96 },
  { status: "delivered", label: "Delivered", offsetHours: 120 },
];

function addHours(iso, hours) {
  return new Date(new Date(iso).getTime() + hours * 60 * 60 * 1000).toISOString();
}

function buildDeliveryTimeline(createdAt) {
  const events = STAGES.map((stage) => ({
    status: stage.status,
    label: stage.label,
    at: addHours(createdAt, stage.offsetHours),
  }));
  return {
    events,
    estimatedDelivery: events.find((e) => e.status === "delivered")?.at || addHours(createdAt, 120),
  };
}

function getDeliveryState(timeline, now = new Date()) {
  const t = now.getTime();
  let currentStatus = timeline[0]?.status || "confirmed";
  let currentLabel = timeline[0]?.label || "Order confirmed";

  const enriched = timeline.map((event, i) => {
    const done = new Date(event.at).getTime() <= t;
    if (done) {
      currentStatus = event.status;
      currentLabel = event.label;
    }
    const next = timeline[i + 1];
    const active = done && (!next || new Date(next.at).getTime() > t);
    return { ...event, done, active };
  });

  const allDone = enriched.every((e) => e.done);
  if (allDone && enriched.length) {
    enriched[enriched.length - 1].active = true;
    currentStatus = enriched[enriched.length - 1].status;
    currentLabel = enriched[enriched.length - 1].label;
  }

  return { currentStatus, currentLabel, timeline: enriched };
}

module.exports = { buildDeliveryTimeline, getDeliveryState, STAGES };
