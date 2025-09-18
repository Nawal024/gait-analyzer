// حساب الزوايا بين 3 نقاط (درجة)
export function angleDeg(a, b, c) {
  if (!a || !b || !c) return null;
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m1 = Math.hypot(v1.x, v1.y);
  const m2 = Math.hypot(v2.x, v2.y);
  if (m1 === 0 || m2 === 0) return null;
  let cos = dot / (m1 * m2);
  cos = Math.min(1, Math.max(-1, cos));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function lineAngleDeg(p1, p2) {
  if (!p1 || !p2) return null;
  const dy = p2.y - p1.y;
  const dx = p2.x - p1.x;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}
