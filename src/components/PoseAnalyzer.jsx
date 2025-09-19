import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

import { drawPose } from '../utils/drawing';
import { computeFrameMetrics, initAccumulator, pushFrame, summarize, buildReport } from '../utils/gaitMetrics';

const FPS = 30;

// إضافة onKpis كـ prop
export default function PoseAnalyzer({ onReport, onKpis }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const accRef = useRef(initAccumulator());

  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [useCamera, setUseCamera] = useState(true);
  const [camFacing, setCamFacing] = useState('environment');
  const [kpis, setKpis] = useState({ cadence: '-', knees: '-', trunk: '-', symmetry: '-' });
  const [fileURL, setFileURL] = useState(null);

  useEffect(() => {
    (async () => {
      await tf.setBackend('webgl');
      await tf.ready();
      const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING, enableSmoothing: true };
      detectorRef.current = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
      setReady(true);
      console.log('Detector ready');
    })();

    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // إضافة useEffect جديد لتمرير المقاييس الحية للمكوّن الأب
  useEffect(() => {
    if (onKpis) {
        onKpis(kpis);
    }
  }, [kpis, onKpis]);


  async function startCamera() {
    stopAll();
    const constraints = {
      video: {
        width: { ideal: 960 },
        height: { ideal: 540 },
        frameRate: { ideal: FPS },
        facingMode: camFacing
      },
      audio: false
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const v = videoRef.current;
    v.srcObject = stream;
    await v.play();
    resizeCanvasToVideo();
  }

  async function loadVideoFile(file) {
    stopAll();
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFileURL(url);
    const v = videoRef.current;
    v.srcObject = null;
    v.src = url;
    v.loop = false;
    await v.play();
    await new Promise((r) => {
      if (v.readyState >= 2) r();
      else v.onloadedmetadata = r;
    });
    resizeCanvasToVideo();
  }

  function resizeCanvasToVideo() {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
  }

  function stopCameraTracks() {
    const v = videoRef.current;
    const stream = v?.srcObject;
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      v.srcObject = null;
    }
  }

  function stopAll() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    stopCameraTracks();
    setRunning(false);
  }

  async function loop() {
    rafRef.current = requestAnimationFrame(loop);
    await analyzeFrame();
  }

  async function analyzeFrame() {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !detectorRef.current || v.readyState < 2) return;

    const poses = await detectorRef.current.estimatePoses(v, { flipHorizontal: false });
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);

    if (poses?.[0]?.keypoints) {
      drawPose(ctx, poses[0].keypoints, 0.45);
      const fm = computeFrameMetrics(poses[0].keypoints);
      pushFrame(accRef.current, fm);

      const s = summarize(accRef.current, FPS);
      setKpis({
        cadence: s.cadence != null ? `${s.cadence}` : '-',
        knees: (s.leftKneeAvg != null && s.rightKneeAvg != null)
          ? `${s.leftKneeAvg.toFixed(0)}° / ${s.rightKneeAvg.toFixed(0)}°`
          : '-',
        trunk: s.trunkLeanAvg != null ? `${s.trunkLeanAvg.toFixed(1)}°` : '-',
        symmetry: s.symmetry != null ? `${s.symmetry.toFixed(0)}%` : '-'
      });
    } else {
    }
  }

  async function startAnalysis() {
    if (!ready) {
      alert('الوجه التحليلي غير جاهز بعد، انتظر ثواني ثم جرب.');
      return;
    }
    accRef.current = initAccumulator();
    if (useCamera) await startCamera();
    else if (fileURL) {
      const v = videoRef.current;
      v.currentTime = 0;
      await v.play();
    } else {
      alert('حمّل فيديو أو فعل الكاميرا أولاً.');
      return;
    }

    setRunning(true);
    loop();

    const v = videoRef.current;
    v.onended = () => {
      stopAnalysis();
    };
  }

  function stopAnalysis() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (useCamera) stopCameraTracks();
    setRunning(false);

    const summary = summarize(accRef.current, FPS);
    const rep = buildReport(summary);
    if (onReport) onReport(rep);
  }

  function toggleFacing() {
    setCamFacing(f => f === 'user' ? 'environment' : 'user');
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    loadVideoFile(file);
  }

  return (
    <div>
      {/* تم إزالة المقاييس من هنا */}
      <div className="card" style={{ padding: 12 }}>
        <div
          className="card"
          style={{
            padding: '20px',
            backgroundColor: '#1b244d',
            textAlign: 'center',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '5px', fontSize: '1.5em' }}>
            اختر مصدر الفيديو
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '160px',
                height: '50px',
                border: '2px solid #90caf9',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <input type="radio" checked={useCamera} onChange={() => setUseCamera(true)} />
              استخدام الكاميرا
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '170px',
                height: '50px',
                border: '2px solid #90caf9',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <input type="radio" checked={!useCamera} onChange={() => setUseCamera(false)} />
              اختيار من الاستديو
            </label>
          </div>
        </div>

        <div className="canvas-wrap">
          <video ref={videoRef} playsInline muted style={{ transform: 'scaleX(1)' }} />
          <canvas ref={canvasRef} />
        </div>

        <div className="controls-row" style={{ marginTop: 10 }}>
          <div className="controls">
            <button
              className="btn"
              onClick={startAnalysis}
              disabled={running || !ready}
            >
              <span style={{ marginLeft: "8px" }}>▶</span> تشغيل التحليل
            </button>
            <button
              className="btn secondary"
              onClick={stopAnalysis}
              disabled={!running}
            >
              <span style={{ marginLeft: "8px" }}>■</span> إيقاف + تقرير
            </button>
            <button
              className="btn secondary"
              onClick={toggleFacing}
              disabled={running}
            >
              <span style={{ marginLeft: "8px" }}>↻</span> تبديل الكاميرا (
              {camFacing === "user" ? "أمامية" : "خلفية"})
            </button>
          </div>
          {!useCamera && (
            <div style={{ marginLeft: '8px' }}>
              <input type="file" accept="video/*" onChange={handleFile} />
            </div>
          )}
        </div>

        <div className="hint">
          <strong>نصائح للتصوير:</strong>
          <ul className="hint-list">
            <li>
              <span className="icon cam">📷</span>
              ضع الكاميرا من <strong>الجانب (Side view)</strong> على بُعد <strong>2.5 – 4 أمتار</strong>
            </li>
            <li>
              <span className="icon light">💡</span>
              وفِّر <strong>إضاءة جيدة ومتجانسة</strong> وتجنّب الخلفية المضيئة
            </li>
            <li>
              <span className="icon body">👤</span>
              احرص أن <strong>يظهر الجسم كاملاً داخل الإطار طوال المشي</strong>
            </li>
            <li>
              <span className="icon steps">👣</span>
              <strong>امشِ 6 – 10 خطوات</strong> بسرعة ثابتة
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}