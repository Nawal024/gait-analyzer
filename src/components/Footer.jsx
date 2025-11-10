import React from "react";
import { FaLaptopCode, FaCode, FaEnvelope, FaLightbulb } from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      style={{
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(6px)",
        color: "white",
        textAlign: "center",
        padding: "10px 0",
        marginTop: "30px",
        fontSize: "18px",
      }}
    >
      {/* Project name */}
      <p
        style={{
          marginBottom: "8px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px",
        }}
      >
       
        <span style={{ direction: "ltr" }}>Gait Analysis &copy; 2025</span>
         <FaCode style={{ color: "#00d9ff", fontSize: "18px" }} />
      </p>


      {/* Design & Development */}
      <p
        style={{
          marginBottom: "8px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span>Design & Development by : <strong>Nawal Alzubidi</strong></span>
                <FaLaptopCode style={{ color: "#00d9ff", fontSize: "28px" }} />

      </p>

         {/* Idea */}
      <p
        style={{
          marginBottom: "8px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px",
        }}
      >
        
        <span>Idea : <strong>Fatimah Almuaydi</strong></span>
        <FaLightbulb style={{ color: "#00d9ff", fontSize: "17px" }} />
      </p>

      {/* Email */}
      <p
        style={{
          marginBottom: "8px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <a
          href="mailto:nawalalzubaidi4@gmail.com"
          style={{
            color: "white",
            textDecoration: "none",
          }}
        >
          nawalalzubaidi4@gmail.com
        </a>
                <FaEnvelope style={{ color: "#00d9ff", fontSize: "16px" }} />

      </p>
    </footer>
  );
};

export default Footer;
