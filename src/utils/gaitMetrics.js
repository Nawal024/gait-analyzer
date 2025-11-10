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

    // نحافظ على المجاميع القديمة (للتماشي والعودة للخلف)
    leftKneeSum: 0, rightKneeSum: 0, trunkLeanSum: 0,

    // ********* الحقول الجديدة الهامة لثبات النتائج *********
    // نخزن أصغر زاوية تمّ رصدها لكل ركبة (أي أقصى انثناء)
    minKneeL: 180,
    minKneeR: 180,
    // نخزن أقصى ميل في الجذع (أعلى قيمة)
    maxTrunkLean: 0,

    // بيانات الكاحل كما كانت
    ankleHistL: [], ankleHistR: [], maxHist: 600,

    // (مكان لإضافة حقول مستقبلية مثل المسافة/السرعة)
    hipHist: [],

    // مقياس التحويل من بكسل إلى سم (سيضبطه PoseAnalyzer بعد معرفة videoWidth)
    pxToCm: null,
  };
}

export function pushFrame(acc, frame) {
  acc.frames++;

  // مجموعات قديمة (نتركها للتوافق)
  if (frame.leftKnee != null) acc.leftKneeSum += frame.leftKnee;
  if (frame.rightKnee != null) acc.rightKneeSum += frame.rightKnee;
  if (frame.trunkLean != null) acc.trunkLeanSum += frame.trunkLean;

  // ********* تحديث القيم الجديدة (أقصى/أصغر) *********
  if (frame.leftKnee != null) {
    if (frame.leftKnee < acc.minKneeL) acc.minKneeL = frame.leftKnee;
  }
  if (frame.rightKnee != null) {
    if (frame.rightKnee < acc.minKneeR) acc.minKneeR = frame.rightKnee;
  }
  if (frame.trunkLean != null) {
    if (frame.trunkLean > acc.maxTrunkLean) acc.maxTrunkLean = frame.trunkLean;
  }

  // الكاحل كما كان
 // نسجل مواقع الكاحل الأفقية مع المحافظة على الطول
  if (frame.la) {
    acc.ankleHistL.push(frame.la.x);
    if (acc.ankleHistL.length > acc.maxHist) acc.ankleHistL.shift();
  } else {
    // نضيف null للمحافظة على تطابق الفهارس إن رغبت
    acc.ankleHistL.push(null);
    if (acc.ankleHistL.length > acc.maxHist) acc.ankleHistL.shift();
  }
  if (frame.ra) {
    acc.ankleHistR.push(frame.ra.x);
    if (acc.ankleHistR.length > acc.maxHist) acc.ankleHistR.shift();
  } else {
    acc.ankleHistR.push(null);
    if (acc.ankleHistR.length > acc.maxHist) acc.ankleHistR.shift();
  }

}

// دالة مساعدة: إيجاد مؤشرات القمم المحلية في مصفوفة أعداد
function findPeaks(arr) {
  const peaks = [];
  if (!arr || arr.length < 3) return peaks;
  for (let i = 1; i < arr.length - 1; i++) {
    const prev = arr[i - 1], cur = arr[i], next = arr[i + 1];
    if (prev == null || cur == null || next == null) continue;
    if (cur > prev && cur >= next) peaks.push(i);
    // نستخدم >= للسماح بالقيم الثابتة قليلاً
  }
  return peaks;
}

function amplitude(arr) {
  if (!arr || arr.length < 6) return 0;
  const clean = arr.filter(v => v != null);
  if (clean.length < 6) return 0;
  const min = Math.min(...clean), max = Math.max(...clean);
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
  // متوسط (كما كان)
  const leftKneeAvg = acc.frames ? (acc.leftKneeSum / acc.frames) : null;
  const rightKneeAvg = acc.frames ? (acc.rightKneeSum / acc.frames) : null;
  const trunkLeanAvg = acc.frames ? (acc.trunkLeanSum / acc.frames) : null;

  // // ********* القيم النهائية الجديدة (أقصى انثناء = أقل زاوية) *********
  // const leftKneeMaxFlexion = (acc.frames && acc.minKneeL < 180) ? acc.minKneeL : null;
  // const rightKneeMaxFlexion = (acc.frames && acc.minKneeR < 180) ? acc.minKneeR : null;
  // const maxTrunkLean = acc.frames ? acc.maxTrunkLean : null;

  const ampL = amplitude(acc.ankleHistL);
  const ampR = amplitude(acc.ankleHistR);
  const symmetry = (ampL + ampR) ? Math.abs(ampL - ampR) / ((ampL + ampR) / 2) * 100 : null;

  const strideSymmetry = (ampL + ampR)
  ? 100 - (Math.abs(ampL - ampR) / ((ampL + ampR) / 2) * 100)
  : null;

  // ---- NEW: حساب أطوال الخطوات عند قمم الحركة لكل كاحل ----
  // نجد مؤشرات القمم لكل كاحل (تكون مؤشرات على ankleHist arrays)
  const peaksL = findPeaks(acc.ankleHistL);
  const peaksR = findPeaks(acc.ankleHistR);

  // على كل قمة نحسب المسافة الأفقية بين الكاحلين عند نفس المؤشر
  const leftStepPx = peaksL
    .map(i => {
      const aL = acc.ankleHistL[i];
      const aR = acc.ankleHistR[i];
      return (aL != null && aR != null) ? Math.abs(aL - aR) : null;
    })
    .filter(v => v != null);

  const rightStepPx = peaksR
    .map(i => {
      const aL = acc.ankleHistL[i];
      const aR = acc.ankleHistR[i];
      return (aL != null && aR != null) ? Math.abs(aL - aR) : null;
    })
    .filter(v => v != null);

  const avgPx = arr => (arr && arr.length) ? (arr.reduce((s, x) => s + x, 0) / arr.length) : null;

  const leftStepAvgPx = avgPx(leftStepPx);
  const rightStepAvgPx = avgPx(rightStepPx);

  // تحويل px إلى سم إذا كان pxToCm معروف
  const leftStepAvgCm = (leftStepAvgPx != null && acc.pxToCm) ? leftStepAvgPx * acc.pxToCm : (leftStepAvgPx != null ? leftStepAvgPx : null);
  const rightStepAvgCm = (rightStepAvgPx != null && acc.pxToCm) ? rightStepAvgPx * acc.pxToCm : (rightStepAvgPx != null ? rightStepAvgPx : null);


  const cadL = estimateCadence(acc.ankleHistL, fps);
  const cadR = estimateCadence(acc.ankleHistR, fps);
  let cadence = null;
  if (cadL && cadR) cadence = Math.round((cadL + cadR) / 2);
  else cadence = cadL || cadR || null;

   // حساب تماثل الطول (النسبة)
  let stepSymmetryPercent = null;
  if (leftStepAvgCm != null && rightStepAvgCm != null && (leftStepAvgCm + rightStepAvgCm) > 0) {
    const smaller = Math.min(leftStepAvgCm, rightStepAvgCm);
    const larger = Math.max(leftStepAvgCm, rightStepAvgCm);
    stepSymmetryPercent = (smaller / larger) * 100;
  }

  return {
    // القيم القديمة — لعدم كسر واجهات الاستخدام
    leftKneeAvg, rightKneeAvg, trunkLeanAvg,
    // القيم الجديدة العلمية والدقيقة
    // leftKneeMaxFlexion, rightKneeMaxFlexion, maxTrunkLean,
    // القيم الأخرى كما كانت
    symmetry, cadence,
    strideSymmetry,

     // القيم الجديدة لعرض طول الخطوة والتماثل
    leftStepAvgCm, rightStepAvgCm, stepSymmetryPercent
  };
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

  // ********** استخدم الآن أقصى انثناء (Maximum Flexion) لزاوية الركبة **********
  // if (summary.leftKneeMaxFlexion != null && summary.rightKneeMaxFlexion != null) {
  //   const lk = summary.leftKneeMaxFlexion.toFixed(1);
  //   const rk = summary.rightKneeMaxFlexion.toFixed(1);
  //   const diff = Math.abs(summary.leftKneeMaxFlexion - summary.rightKneeMaxFlexion);
  //   let status = "متوازن ✅";
  //   let note = null;

  //   // معيار التماثل: فرق أكثر من 10 درجات يعتبر ملحوظاً (قابل للتعديل حسب قرارك)
  //   if (diff > 10) {
  //     status = "عدم تماثل ⚠️";
  //     note = "يوجد اختلاف في أقصى انثناء بين الركبتين، قد يدل على اعتماد أكبر على ساق واحدة أو ضعف.";
  //   }

  //   metrics.push({
  //     title: "أقصى انثناء ركبة (Maximum knee flexion)",
  //     value: `اليسرى: ${lk}° / اليمنى: ${rk}° (الفرق: ${diff.toFixed(0)}°)`,
  //     status: status
  //   });
  //   if (note) notes.push(note);
  // } else {
    // رجّع التقييم القديم إذا لم يتوفر الحقل الجديد (توافق خلفي)
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
  

  // ميل الجذع (Trunk lean) - نستخدم الآن maxTrunkLean في التقرير
  // if (summary.maxTrunkLean != null) {
  //   const tl = summary.maxTrunkLean.toFixed(1);
  //   let status = "طبيعي ✅";
  //   let note = null;
  //   if (summary.maxTrunkLean > 10) {
  //     status = "ميل واضح ⚠️";
  //     note = "قد يشير إلى تعويض في الحركة أو ضعف في العضلات الأساسية.";
  //   }
  //   metrics.push({
  //     title: "أقصى ميل جذع (Max trunk lean)",
  //     value: `${tl}°`,
  //     status: status
  //   });
  //   if (note) notes.push(note);
  // } else
     if (summary.trunkLeanAvg != null) {
    // تراجع إلى المتوسط إن لم تتوفر القيمة القصوى
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

  // سرعة المشي (Walking speed)
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
