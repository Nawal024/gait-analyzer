import React, { useState } from 'react';
import './index.css';
import PoseAnalyzer from './components/PoseAnalyzer';
// استيراد الأيقونات
import { CadenceIcon, TrunkIcon, SymmetryIcon } from './utils/Icons';
import { GiKneeCap } from "react-icons/gi";
import Footer from './components/Footer';
import KneeAngleTrendChart from "./components/KneeAngleTrendChart";
import StrideSymmetryChart from "./components/StrideSymmetryChart";



export default function App() {
const [report, setReport] = useState(null);
  // حالة جديدة لحفظ المقاييس
  const [kpis, setKpis] = useState({ cadence: '-', knees: '-', trunk: '-', symmetry: '-' });

  const [kneeChartData, setKneeChartData] = useState([]);
  const [strideSymmetryData, setStrideSymmetryData] = useState([]); // 🆕 لحفظ بيانات تماثل سعة الحركة
  const [stepData, setStepData] = useState({ leftStepLength: 0, rightStepLength: 0 }); // 🆕 أطوال الخطوة اليمنى واليسرى



  const handleKneeDataUpdate = (data) => {
    // تخزين فقط الزوايا التي لها قيمة (ليست null)
    if (data.left !== null || data.right !== null) {
        setKneeChartData(prevData => [...prevData, data]);
    }
  };

  // 🆕 متابعة تحديثات مقياس تماثل سعة الحركة
React.useEffect(() => {
  if (kpis.strideSymmetry && kpis.strideSymmetry !== '-') {
    setStrideSymmetryData(prev => [
      ...prev,
      { frame: prev.length + 1, value: parseFloat(kpis.strideSymmetry) }
    ]);
  }
}, [kpis.strideSymmetry]);

  // **********************************
  
  // دالة تحضير بيانات الرسم البياني
  const chartConfig = {
    labels: kneeChartData.map(d => d.frame), // محوّر X: رقم الإطار
    datasets: [
      {
        label: 'الركبة اليسرى',
        data: kneeChartData.map(d => d.left),
        borderColor: '#4facfe',
        tension: 0.4, // لجعل الخط منحنيًا
      },
      {
        label: 'الركبة اليمنى',
        data: kneeChartData.map(d => d.right),
        borderColor: '#ff6b6b',
        tension: 0.4,
      }
    ],
  };
  return (
    <>
      {/* الهيدر صار برا */}
     <header className="header">
  <div className="header-content">
    <img src="logo.png" alt="Logo" className="header-logo"  />
    {/* <h1 className="title">تحليل المشية</h1> */}
  </div>
</header>


      {/* الحين المحتوى يظل داخل container */}
      <div className="app-container">
      <main className="grid">
        <div className="card">
          {/* تمرير دالة تحديث المقاييس إلى PoseAnalyzer */}
          <PoseAnalyzer
  onReport={setReport}
  onKpis={(newKpis) => {
    setKpis(newKpis);
 if (newKpis.leftStepLength != null && newKpis.rightStepLength != null) {      setStepData({
        leftStepLength: newKpis.leftStepLength,
        rightStepLength: newKpis.rightStepLength,
      });
    }
  }}
  onKneeDataUpdate={handleKneeDataUpdate}
/>


          <p className="note">
            ⚠️ هذا تحليل مبدئي وليس تشخيصًا. لتحليل طبي دقيق، راجع طبيب متخصص.
          </p>
        </div>

        <div className="card">
          <h2>📋 التقرير</h2>
          
          {/* إضافة المقاييس الأربعة هنا */}
          <div className="kpis">
            <div className="kpi">
              <CadenceIcon size={30} />
              <h4>الكادِنس</h4>
              <div className="val">{kpis.cadence}</div>
            </div>
            <div className="kpi">
              <GiKneeCap className="icon green" size={30} />
              <h4>زاوية الركبة</h4>
              <div className="val">{kpis.knees}</div>
            </div>
            <div className="kpi">
              <TrunkIcon size={30} />
              <h4>ميل الجذع</h4>
              <div className="val">{kpis.trunk}</div>
            </div>
            <div className="kpi">
              <SymmetryIcon size={30} />
              <h4>التماثل</h4>
              <div className="val">{kpis.symmetry}</div>
            </div>
          </div>

          {/* استبدال <pre> بهيكل جديد */}
          <div className="report-container">
            {report ? (
              <>
                {report.metrics.map((metric, index) => (
                  <div key={index} className="report-item">
                    <div className="report-header">
                      <h3>{metric.title}</h3>
                      <span className="report-status">{metric.status}</span>
                    </div>
                    <p className="report-value">{metric.value}</p>
                  </div>
                ))}
                {/* عرض الملاحظات */}
                <div className="report-notes">
                  <h4>📌 ملاحظات مبسطة:</h4>
                  <p>{report.notes}</p>
                </div>
              </>
            ) : (
              <p>ابدأ التحليل وسيظهر التقرير هنا.</p>
            )}
          </div>

<div className="stride-symmetry-section">
    <h3>👣 تحليل تماثل طول الخطوة</h3>

    {/* الرسم البياني لتماثل الخطوة */}
    <StrideSymmetryChart
      leftStepLength={stepData.leftStepLength}
      rightStepLength={stepData.rightStepLength}
    />

    {/* الجملة تظهر فقط قبل بدء التحليل */}
    {stepData.leftStepLength === 0 && stepData.rightStepLength === 0 && (
      <p className="placeholder-text">
        ابدأ التحليل لعرض تماثل طول الخطوة بين الساقين.
      </p>
    )}
  </div>

        </div>
      </main>
    </div>
      <Footer />    </>
  );
}