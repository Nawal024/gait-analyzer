import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Info } from "lucide-react";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

export default function StrideAmplitudeTrendChart({ leftAmplitude, rightAmplitude }) {
  const [showInfo, setShowInfo] = useState(false);

  const left = leftAmplitude ? Number(leftAmplitude.toFixed(1)) : 0;
  const right = rightAmplitude ? Number(rightAmplitude.toFixed(1)) : 0;
  const diff = Math.abs(left - right);

  let analysisText = "";
  let adviceText = "";
  let color = "";

  if (diff <= 10) {
    analysisText = "✅ تماثل ممتاز في سعة الخطوة.";
    adviceText = "الحركة متناغمة بين الساقين، مما يدل على توازن عضلي جيد.";
    color = "#4caf50";
  } else {
    analysisText = "⚠️ يوجد فرق ملحوظ في سعة الخطوة.";
    adviceText = "قد يشير إلى ضعف في الساق ذات الخطوة الأقصر أو ألم أثناء الدفع.";
    color = "#ffb74d";
  }

  const data = {
    labels: ["الساق اليسرى", "الساق اليمنى"],
    datasets: [
      {
        label: "سعة الحركة (سم)",
        data: [left, right],
        borderColor: "#00e5ff",
        backgroundColor: "rgba(0, 229, 255, 0.2)",
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: "#00e5ff",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "📈 تماثل سعة الخطوة (Stride Amplitude Symmetry)",
        color: "#00e5ff",
        font: { size: 16, weight: "bold" },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: "السعة (سم)",
          color: "#00e5ff",
        },
        ticks: { color: "#fff" },
        grid: { color: "rgba(0, 229, 255, 0.1)" },
      },
      x: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(0, 229, 255, 0.1)" },
      },
    },
  };

  return (
    <div
      className="neon-card p-4 rounded-2xl shadow-lg mt-4 relative"
      style={{
        background: "linear-gradient(145deg, #0a0f1f, #0d1628)",
        boxShadow: "0 0 15px rgba(0, 229, 255, 0.3)",
        border: "1px solid rgba(0, 229, 255, 0.2)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg text-cyan-400 font-semibold">
          مقارنة سعة الحركة بين الساقين
        </h3>
        <button onClick={() => setShowInfo(!showInfo)} className="text-cyan-400 hover:text-white">
          <Info size={20} />
        </button>
      </div>

      {showInfo && (
        <div
          className="p-3 mb-3 rounded-lg text-sm text-gray-200"
          style={{ background: "rgba(0, 229, 255, 0.08)" }}
        >
          <p className="mb-2">
            📘 <strong>الوصف:</strong> يقارن هذا المخطط بين متوسط <strong>طول الخطوة</strong> (المسافة الأفقية بين القدمين)
            للجانب الأيمن مقابل الجانب الأيسر.
          </p>
          <p className="mb-2">
            التباين بنسبة <strong>أكبر من 10%</strong> يُعتبر غير طبيعي، وغالبًا يشير إلى ضعف عضلي في الساق التي تضغط
            بقوة أقل (والتي تكون خطوتها <strong>أقصر</strong>) أو وجود ألم في تلك الساق يسبب تجنّب الدفع.
          </p>
          <p className="text-xs text-cyan-300">
            🔗 المصادر: <br />
            • Kirtley (2005) – Clinical Gait Analysis (Symmetry Indexes) <br />
            • Bohannon (1997) – Step Length Norms
          </p>
        </div>
      )}

      <Line data={data} options={options} />

      <div className="mt-4 text-center">
        <p style={{ color }}>{analysisText}</p>
        <p className="text-gray-300 text-sm">{adviceText}</p>
      </div>
    </div>
  );
}
