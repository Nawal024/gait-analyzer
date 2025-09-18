import React, { useState } from 'react';
import './index.css';
import PoseAnalyzer from './components/PoseAnalyzer';
// استيراد الأيقونات
import { CadenceIcon, TrunkIcon, SymmetryIcon } from './utils/Icons';
import { GiKneeCap } from "react-icons/gi";

export default function App() {
const [report, setReport] = useState(null);
  // حالة جديدة لحفظ المقاييس
  const [kpis, setKpis] = useState({ cadence: '-', knees: '-', trunk: '-', symmetry: '-' });
  return (
    <>
      {/* الهيدر صار برا */}
     <header className="header">
  <div className="header-content">
    <img src="/src/assets/ss.png" alt="Logo" className="header-logo"  />
    {/* <h1 className="title">تحليل المشية</h1> */}
  </div>
</header>


      {/* الحين المحتوى يظل داخل container */}
      <div className="app-container">
      <main className="grid">
        <div className="card">
          {/* تمرير دالة تحديث المقاييس إلى PoseAnalyzer */}
          <PoseAnalyzer onReport={setReport} onKpis={setKpis} />
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
              <GiKneeCap className="icon green" size={38} style={{ marginBottom: '12px' }}/>
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
        </div>
      </main>
    </div>
        </>
  );
}