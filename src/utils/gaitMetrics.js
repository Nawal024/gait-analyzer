import { angleDeg, lineAngleDeg } from './angles';

export function extractNamed(keypoints) {
  if (!keypoints) return {};
  const byIdx = (i) => keypoints[i] ? { x: keypoints[i].x, y: keypoints[i].y, score: keypoints[i].score } : null;
  return {
    ls: byIdx(5), rs: byIdx(6),
    lh: byIdx(11), rh: byIdx(12),
    lk: byIdx(13), rk: byIdx(14),
    la: byIdx(15), ra: byIdx(16),
  };
}

export function computeFrameMetrics(keypoints) {
  const { ls, rs, lh, rh, lk, rk, la, ra } = extractNamed(keypoints);

  const leftKnee = (lk && lh && la) ? angleDeg(lh, lk, la) : null;
  const rightKnee = (rk && rh && ra) ? angleDeg(rh, rk, ra) : null;

  let trunkLean = null;
  if (ls && rs && lh && rh) {
    const midHip = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
    const midShoulder = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
    const ang = lineAngleDeg(midHip, midShoulder);
    trunkLean = Math.abs(90 - Math.abs(ang));
  }

  return { leftKnee, rightKnee, trunkLean, la, ra };
}

export function initAccumulator() {
  return {
    frames: 0,
    leftKneeSum: 0, rightKneeSum: 0, trunkLeanSum: 0,
    ankleHistL: [], ankleHistR: [], maxHist: 600
  };
}

export function pushFrame(acc, frame) {
  acc.frames++;
  if (frame.leftKnee != null) acc.leftKneeSum += frame.leftKnee;
  if (frame.rightKnee != null) acc.rightKneeSum += frame.rightKnee;
  if (frame.trunkLean != null) acc.trunkLeanSum += frame.trunkLean;

  if (frame.la) {
    acc.ankleHistL.push(frame.la.x);
    if (acc.ankleHistL.length > acc.maxHist) acc.ankleHistL.shift();
  }
  if (frame.ra) {
    acc.ankleHistR.push(frame.ra.x);
    if (acc.ankleHistR.length > acc.maxHist) acc.ankleHistR.shift();
  }
}

function amplitude(arr) {
  if (!arr || arr.length < 6) return 0;
  const min = Math.min(...arr), max = Math.max(...arr);
  return max - min;
}

function estimateCadence(arr, fps = 30) {
  if (!arr || arr.length < fps) return null;
  const v = [];
  for (let i = 1; i < arr.length; i++) v.push(arr[i] - arr[i - 1]);
  let peaks = 0;
  for (let i = 1; i < v.length; i++) {
    if (v[i - 1] > 0 && v[i] <= 0) peaks++;
  }
  const seconds = arr.length / fps;
  const peaksPerSec = peaks / seconds;
  const stepsPerMin = peaksPerSec * 60;
  return Math.round(stepsPerMin);
}

export function summarize(acc, fps = 30) {
  const leftKneeAvg = acc.frames ? (acc.leftKneeSum / acc.frames) : null;
  const rightKneeAvg = acc.frames ? (acc.rightKneeSum / acc.frames) : null;
  const trunkLeanAvg = acc.frames ? (acc.trunkLeanSum / acc.frames) : null;

  const ampL = amplitude(acc.ankleHistL);
  const ampR = amplitude(acc.ankleHistR);
  const symmetry = (ampL + ampR) ? Math.abs(ampL - ampR) / ((ampL + ampR) / 2) * 100 : null;

  const cadL = estimateCadence(acc.ankleHistL, fps);
  const cadR = estimateCadence(acc.ankleHistR, fps);
  let cadence = null;
  if (cadL && cadR) cadence = Math.round((cadL + cadR) / 2);
  else cadence = cadL || cadR || null;

  return { leftKneeAvg, rightKneeAvg, trunkLeanAvg, symmetry, cadence };
}

// تعديل الدالة لإنشاء كائن بدلاً من نص
export function buildReport(summary) {
  const metrics = [];
  const notes = [];

  // الكادِنس (Cadence)
  if (summary.cadence != null) {
    const cad = summary.cadence;
    let status = "طبيعي ✅";
    let note = null;
    if (cad < 80) {
      status = "بطء في المشي ⚠️";
      note = "قد يشير إلى ضعف عضلي أو مشكلة في التوازن.";
    } else if (cad > 130) {
      status = "أسرع من الطبيعي ⚠️";
      note = "قد تكون مرتبطة بتوتر أو خلل في نمط الحركة.";
    }
    metrics.push({
      title: "الكادِنس (Cadence)",
      value: `${cad} خطوة/دقيقة`,
      status: status
    });
    if (note) notes.push(note);
  }

  // زاوية الركبة (Knee flexion angle)
  if (summary.leftKneeAvg != null && summary.rightKneeAvg != null) {
    const lk = summary.leftKneeAvg.toFixed(1);
    const rk = summary.rightKneeAvg.toFixed(1);
    let status = "طبيعي ✅";
    let note = null;

    if (lk < 140 || rk < 140) {
      status = "نقص في ثني الركبة ⚠️";
      note = "قد يدل على تيبّس أو ضعف.";
    }
    if (lk > 170 || rk > 170) {
      status = "فرط تمدد ⚠️";
      note = "قد يشير إلى ضعف التحكم الحركي.";
    }
    metrics.push({
      title: "متوسط زاوية الركبة (Knee flexion angle)",
      value: `اليسار: ${lk}° / اليمين: ${rk}°`,
      status: status
    });
    if (note) notes.push(note);
  }

  // ميل الجذع (Trunk lean)
  if (summary.trunkLeanAvg != null) {
    const tl = summary.trunkLeanAvg.toFixed(1);
    let status = "طبيعي ✅";
    let note = null;
    if (summary.trunkLeanAvg > 10) {
      status = "ميل واضح ⚠️";
      note = "قد يشير إلى تعويض في الحركة أو ضعف في العضلات الأساسية.";
    }
    metrics.push({
      title: "ميل الجذع (Trunk lean)",
      value: `${tl}°`,
      status: status
    });
    if (note) notes.push(note);
  }

  // التماثل (Ankle symmetry)
  if (summary.symmetry != null) {
    const sym = summary.symmetry.toFixed(1);
    let status = "متماثل ✅";
    let note = null;
    if (summary.symmetry > 20) {
      status = "عدم تماثل ملحوظ ⚠️";
      note = "قد يدل على فرق في القوة أو مشكلة في أحد الطرفين.";
    }
    metrics.push({
      title: "تماثل حركة الكاحل (Ankle symmetry)",
      value: `${sym}%`,
      status: status
    });
    if (note) notes.push(note);
  }

 // سرعة المشي (Walking speed) - تم إضافتها الآن
  if (summary.walkingSpeed != null) {
    const spd = summary.walkingSpeed.toFixed(2);
    let status = "طبيعي ✅";
    let note = null;
    if (summary.walkingSpeed < 1.0) {
      status = "بطيء ⚠️";
      note = "قد يشير إلى ضعف القدرة الوظيفية أو مشكلة في التوازن.";
    } else if (summary.walkingSpeed > 1.6) {
      status = "أسرع من المعتاد ⚠️";
      note = "قد يكون مرتبطًا بجهد زائد أو خلل في نمط المشي.";
    }
    metrics.push({
      title: "سرعة المشي (Walking speed)",
      value: `${spd} م/ث`,
      status: status
    });
    if (note) notes.push(note);
  }

  // بناء التقرير النهائي
  let finalNotes = notes.length
    ? notes.map(n => `- ${n}`).join("\n")
    : "✅ لا توجد مؤشرات واضحة على مشاكل — هذا تحليل مبدئي فقط.";
 
  return { metrics, notes: finalNotes };
}