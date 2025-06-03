import React, { useEffect, useState } from "react";

const FadeTransition = ({ children }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10); // start fade-in after mount
    return () => setVisible(false); // fade-out on unmount
  }, []);

  return (
    <div
      className={`transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {children}
    </div>
  );
};

export default FadeTransition;
