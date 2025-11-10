import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function StrideSymmetryChart({ leftStepLength, rightStepLength }) {
  const [showInfo, setShowInfo] = useState(false);

  // القيم المدخلة (بـ سم مثلاً)
  const left = leftStepLength ? Number(leftStepLength.toFixed(1)) : 0;
  const right = rightStepLength ? Number(rightStepLength.toFixed(1)) : 0;

  // حساب التماثل بالنسبة المئوية
  const symmetry =
    left && right ? (Math.min(left, right) / Math.max(left, right)) * 100 : 0;
  const diffPercent = 100 - symmetry;

  // تحليل النتيجة
  let analysisText = "";
  let adviceText = "";
  let color = "";

  if (diffPercent <= 10) {
    analysisText = "✅ تماثل ممتاز في طول الخطوة.";
    adviceText = "الحركة متناغمة بين الساقين، مما يدل على توازن عضلي وتناسق جيد.";
    color = "#4caf50";
  } else {
    analysisText = "⚠️ يوجد فرق ملحوظ في طول الخطوة.";
    adviceText = "قد يشير إلى ضعف عضلي أو ألم في الساق ذات الخطوة الأقصر. يُنصح بتقييم السبب.";
    color = "#ffb74d";
  }

  // بيانات الرسم
  const data = {
    labels: ["الساق اليسرى", "الساق اليمنى"],
    datasets: [
      {
        label: "طول الخطوة (سم)",
        data: [left, right],
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          if (context.dataIndex === 0) {
            // تدرج تركوازي
            gradient.addColorStop(0, "#38f9d7");
            gradient.addColorStop(1, "#43e97b");
          } else {
            // تدرج أزرق سماوي
            gradient.addColorStop(0, "#4facfe");
            gradient.addColorStop(1, "#00f2fe");
          }
          return gradient;
        },
        borderRadius: 10,
        borderSkipped: false,
        borderWidth: 0,
        hoverBackgroundColor: "#00ffffaa",
      },
    ],
  };

  // خيارات الرسم
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 10 },
    plugins: {
      legend: { display: false },
      title: {
        display: false,
        text: "📏 تماثل طول الخطوة (Step Length Symmetry)",
        color: "#00e0ff",
        font: { size: 18, weight: "bold" },
        padding: { top: 10, bottom: 15 },
      },
      tooltip: {
        backgroundColor: "rgba(30,30,30,0.95)",
        borderColor: "#00e0ff",
        borderWidth: 1,
        borderRadius: 10,
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(255,255,255,0.08)",
          borderDash: [3, 3],
        },
        ticks: { color: "#ccc", font: { size: 14 } },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(255,255,255,0.08)",
          borderDash: [3, 3],
        },
        title: {
          display: true,
          text: "الطول (سم)",
          color: "#aaa",
          font: { size: 14 },
        },
        ticks: { color: "#ccc", font: { size: 13 } },
        border: { display: false },
      },
    },
  };

  const chartBackgroundPlugin = {
    id: "customGradientBars",
    beforeDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      ctx.save();
      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradient.addColorStop(0, "rgba(30,30,40,0.6)");
      gradient.addColorStop(1, "rgba(10,10,15,0.8)");
      ctx.fillStyle = gradient;
      ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
      ctx.restore();
    },
  };

  return (
    <div
      style={{
        background: "linear-gradient(145deg, rgba(10,20,30,0.8), rgba(20,30,40,0.9))",
        padding: "20px",
        borderRadius: "20px",
        boxShadow: "0 0 25px rgba(0,255,255,0.15)",
        textAlign: "center",
        transition: "0.5s",
        width: "100%",
        position: "relative",
      }}
    >

      {/* الرسم */}
      {/* العنوان مع الأيقونة */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    
    borderRadius: "10px",        // زوايا مستديرة
    padding: "8px 12px",         // المسافة داخل الإطار
    backgroundColor: "rgba(0,224,255,0.05)", // لون خلفية خفيف
    marginBottom: "10px",
  }}
>
  <img
    src="cramp.png"
    alt="تماثل طول الخطوة"
    style={{ width: "30px", height: "30px" }}
  />
  <h3
    style={{
      color: "#00e0ff",
      // fontWeight: "bold",
      fontSize: "18px",
      // textShadow: "0 0 10px rgba(0,224,255,0.6)",
      margin: 0,
    }}
  >
    تماثـل طول الخطوة (Step Length Symmetry)
  </h3>
</div>

{/* زر المعلومات */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          marginBottom: "10px",
        }}
      >
        <button
          onClick={() => setShowInfo(true)}
          style={{
            backgroundColor: "#4fa9ff",
            border: "none",
            borderRadius: "50%",
            width: "28px",
            height: "28px",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
          title="عرض المعلومات العلمية"
        >
          i
        </button>
        <span
          onClick={() => setShowInfo(true)}
          style={{
            color: "#4fa9ff",
            fontSize: "13px",
            cursor: "pointer",
            userSelect: "none",
            textDecoration: "underline",
          }}
        >
          اضغط هنا لعرض المعلومات العلمية
        </span>
      </div>


{/* الرسم */}
<div
  style={{
    height: "250px",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  }}
>
  <Bar data={data} options={options} plugins={[chartBackgroundPlugin]} />
</div>


      {/* التحليل */}
      {(left !== 0 || right !== 0) && (
        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <p style={{ marginTop: "10px", fontWeight: "bold", color }}>{analysisText}</p>
          <p style={{ marginTop: "5px", color: "#ccc" }}>{adviceText}</p>
          <p className="text-cyan-300 text-sm mt-2">
            نسبة التماثل: {symmetry.toFixed(1)}% {diffPercent > 10 ? "❌" : "✅"}
          </p>
        </div>
      )}

      {/* نافذة المعلومات */}
      {showInfo && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(10, 20, 30, 0.95)",
            color: "white",
            padding: "25px",
            borderRadius: "10px",
            width: "340px",
            fontSize: "13px",
            zIndex: 10,
            boxShadow: "0 0 10px rgba(0,255,255,0.5)",
            border: "1px solid #00e0ff66",
          }}
        >
          <b>🧠 المعلومات العلمية:</b>
          <p className="mb-2">
            📘 <strong>الوصف:</strong> يقارن هذا المخطط بين متوسط <strong>طول الخطوة</strong> (المسافة الأفقية بين القدمين)
            للجانب الأيمن مقابل الجانب الأيسر.
          </p>
          <p className="mb-2">
            التباين بنسبة <strong>أكبر من 10%</strong> يُعتبر غير طبيعي، وغالبًا يشير إلى ضعف عضلي في الساق التي تضغط
            بقوة أقل (والتي تكون خطوتها <strong>أقصر</strong>) أو وجود ألم في تلك الساق يسبب تجنّب الدفع.
          </p>
          <p style={{ marginTop: "10px", color: "#aaa" }}>
            <b>المصادر:</b>
            <br /> Kirtley (2005) – <i>Clinical Gait Analysis •</i>
            <br /> Bohannon (1997) – <i>Step Length Norms •</i>
          </p>
          <button
            onClick={() => setShowInfo(false)}
            style={{
              marginTop: "10px",
              background: "#4fa9ff",
              border: "none",
              color: "white",
              padding: "5px 10px",
              borderRadius: "5px",
              cursor: "pointer",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              boxShadow: "0 0 5px rgba(79, 169, 255, 0.7)",
            }}
          >
            ✖️ إغلاق
          </button>
        </div>
      )}
    </div>
  );
}
