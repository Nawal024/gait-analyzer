import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function KneeAngleTrendChart({ leftKnee, rightKnee }) {
  const [showInfo, setShowInfo] = useState(false);

  // تقريب الأرقام
  const left = leftKnee ? Number(leftKnee.toFixed(1)) : 0;
  const right = rightKnee ? Number(rightKnee.toFixed(1)) : 0;
  const diff = Math.abs(left - right);

  // التحليل
  let analysisText = "";
  let adviceText = "";
  let color = "";

  if (diff <= 15) {
    analysisText = "✅ الزاويتان متقاربتان، الحركة متوازنة وطبيعية.";
    adviceText = "استمر على النشاط البدني المعتدل للحفاظ على التوازن العضلي.";
    color = "#4caf50";
  } else {
    analysisText = "ℹ️ يوجد فرق في الزاويتين.";
    adviceText = "ينصح بتمارين تقوية خفيفة للركبتين لتحسين التناسق الحركي.";
    color = "#ffb74d";
  }

  const data = {
    labels: ["الركبة اليسرى", "الركبة اليمنى"],
    datasets: [
      {
        label: "زاوية الركبة (بالدرجات)",
        data: [left, right],
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return null;
          }
          // استخدام التدرج اللوني السابق
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          if (context.dataIndex === 0) {
            // الركبة اليسرى: أخضر تركوازي (Gradient: #38f9d7 to #43e97b)
            gradient.addColorStop(0, "#38f9d7");
            gradient.addColorStop(1, "#43e97b");
          } else {
            // الركبة اليمنى: أزرق سماوي (Gradient: #4facfe to #00f2fe)
            gradient.addColorStop(0, "#4facfe");
            gradient.addColorStop(1, "#00f2fe");
          }
          return gradient;
        },
        borderRadius: 10,
        borderSkipped: false,
        borderWidth: 0,
        hoverBackgroundColor: "#00ffffaa",
        // إضافة ظل خفيف للأعمدة لزيادة تأثير النيون
        shadowColor: 'rgba(0, 255, 255, 0.4)',
        shadowBlur: 15,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      },
    ],
  };
  

  const options = {
    responsive: true,
    maintainAspectRatio: false, // للسماح بالتحكم في الحجم بالارتفاع المحدد
    // إزالة خلفية الرسم البياني
    layout: {
      padding: 10
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "زاوية الركبة النهائية (°)", // تم تعديل النص ليناسب تصميم recharts
        color: "#00e0ff", // لون النيون
        font: { size: 18, weight: 'bold' },
        padding: { top: 10, bottom: 15 } // تعديل التباعد
      },
      tooltip: {
        backgroundColor: "rgba(30,30,30,0.95)",
        borderColor: "#00e0ff", // إطار نيون
        borderWidth: 1,
        borderRadius: 10,
        titleColor: '#fff',
        bodyColor: '#fff',
      },
      // تذكر أن هذا الجزء يتطلب تثبيت مكتبة chartjs-plugin-datalabels
      datalabels: { 
        display: true,
        color: '#fff',
        align: 'end',
        anchor: 'end',
        formatter: (value) => value.toFixed(1),
        font: { size: 14 }
      }
    },
    scales: {
      x: {
        // إعدادات المحور السيني
        grid: {
          display: true,
          drawOnChartArea: true,
          color: "rgba(255,255,255,0.08)", // لون خطوط الشبكة
          lineWidth: 1,
          borderDash: [3, 3], // خط متقطع
        },
        ticks: {
          color: "#ccc", // لون النصوص
          font: { size: 14 }
        },
        border: { display: false } // إزالة إطار المحور
      },
      y: {
        beginAtZero: true,
        max: 180,
        // إعدادات المحور الصادي
        grid: {
          display: true,
          drawOnChartArea: true,
          color: "rgba(255,255,255,0.08)", // لون خطوط الشبكة
          lineWidth: 1,
          borderDash: [3, 3], // خط متقطع
        },
        title: {
          display: true,
          text: "الزاوية (°)",
          color: "#aaa", // لون النص
          font: { size: 14 }
        },
        ticks: {
          color: "#ccc", // لون النصوص
          font: { size: 13 }
        },
        border: { display: false } // إزالة إطار المحور
      },
    },
  };
  
  const chartBackgroundPlugin = {
    id: "customGradientBars",
    beforeDatasetsDraw(chart) {
      const {
        ctx,
        chartArea: { top, bottom, left, right, width },
        scales: { x },
      } = chart;
      chart.data.datasets[0].data.forEach((value, index) => {
        const gradient = ctx.createLinearGradient(0, top, 0, bottom);
        if (index === 0) {
          gradient.addColorStop(0, "#78FFC6");
          gradient.addColorStop(1, "#A8FBD3");
        } else {
          gradient.addColorStop(0, "#6DEEFF");
          gradient.addColorStop(1, "#A1E3F9");
        }
        chart.data.datasets[0].backgroundColor[index] = gradient;
      });
    },
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
    // إضافة تصميم الخلفية والإطار والظل من تصميم recharts 
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
      {/* زر المعلومات الجميل */}
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

      {/* الرسم البياني */}
      {/* تم زيادة ارتفاع الحاوية ليناسب التصميم الأكبر */}
      <div style={{ paddingTop: "10px", height: "250px",  justifyContent: "center",
    alignItems: "center", display: "flex"}}>
<Bar data={data} options={options} plugins={[chartBackgroundPlugin]} />      </div>

      {/* النصوص التحليلية (تظهر فقط بعد بدء التحليل فعلاً) */}
      {(leftKnee !== 0 || rightKnee !== 0) && (
        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <p style={{ marginTop: "10px", fontWeight: "bold", color: color }}>
            {analysisText}
          </p>
          <p style={{ marginTop: "5px", color: "#ccc" }}>{adviceText}</p>
        </div>
      )}


      {/* نافذة المعلومات - تم تعديل الخلفية لتناسب الخلفية الجديدة */}
      {showInfo && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(10, 20, 30, 0.95)", // خلفية داكنة متناسقة
            color: "white",
            padding: "25px",
            borderRadius: "10px",
            width: "340px",
            fontSize: "13px",
            zIndex: 10,
            boxShadow: "0 0 10px rgba(0,255,255,0.5)", // ظل نيون خفيف
            border: "1px solid #00e0ff66"
          }}
        >
          <b>🧠 المعلومات العلمية:</b>
          <p style={{ marginTop: "10px" }}>
            يعتمد التحليل على دراسات حركية تشير إلى أن الفرق الزاوي الطبيعي بين الركبتين أثناء المشي
            يجب أن يكون أقل من <b>10–15°</b>. تجاوز هذا الحد قد يدل على عدم تناسق في الحركة
            أو ضعف عضلي في أحد الطرفين.
          </p>
          <p style={{ marginTop: "10px", color: "#aaa" }}>
            <b>المصادر:</b>
            <br />• Perry & Burnfield (2010) – <i>Gait Analysis</i>
            <br />• Winter (2009) – <i>Biomechanics of Human Movement</i>
            <br />• Kadaba et al. (1989)
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