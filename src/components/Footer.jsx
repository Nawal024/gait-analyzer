import React from "react";
import { FaLaptopCode,FaCode, FaEnvelope } from "react-icons/fa"; // استيراد الأيقونات من مكتبة react-icons

const Footer = () => {
  return (
    <footer
      style={{
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(6px)",
        color: "white",
        textAlign: "center",
        padding: "5px 0",
        marginTop: "30px",
        // fontFamily: "Tajawal, sans-serif",
        fontSize: "18px",
      }}
    >
    
      <p
        style={{
          marginBottom: "8px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <FaCode style={{ color: "#00d9ff", fontSize: "18px" }} />
        <span style={{ direction: "ltr" }}> تحليل المشي &copy; 2025</span>
      </p>

 
<p style={{
  marginBottom: "8px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "6px"
}}>
  <FaLaptopCode style={{ color: "#00d9ff", fontSize: "17px" }} />
  <span>تصميم وتطوير: <strong>نـوال الزبيدي</strong></span>
</p>
     
      <p
        style={{
            marginBottom: "8px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <FaEnvelope style={{ color: "#00d9ff", fontSize: "16px" }} />
        <a
          href="mailto:nawalalzubaidi4@gmail.com"
          style={{
            color: "white",
            textDecoration: "none",
          }}
        >
          nawalalzubaidi4@gmail.com
        </a>
      </p>
    </footer>
  );
};

export default Footer;
