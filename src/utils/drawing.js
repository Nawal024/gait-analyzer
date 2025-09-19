// رسم الهيكل العظمي (keypoints) على canvas
// EDGES تستخدم فهارس keypoints بحسب COCO/MoveNet
const EDGES = [
  [5,6],[5,7],[7,9],[6,8],[8,10],
  [5,11],[6,12],[11,12],
  [11,13],[13,15],[12,14],[14,16]
];

export function drawPose(ctx, keypoints, scoreThresh = 0.4) {
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  ctx.save();
  ctx.scale(1,1);

  // ستايل
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(40,160,255,0.9)';
  ctx.fillStyle = 'rgba(40,160,255,0.9)';

  // حدود canvas نظيفه (لن نغطي كامل تغيير الأبعاد هنا، نترك كونفج في الأعلى)
  for (const [i,j] of EDGES) {
    const a = keypoints[i], b = keypoints[j];
    if (a?.score >= scoreThresh && b?.score >= scoreThresh) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  // نقاط
  for (const kp of keypoints) {
    if (kp?.score >= scoreThresh) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

