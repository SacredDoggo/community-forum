"use client";

import { useEffect, useState } from "react";

export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const handleWindowSizeChange = () => {
            setIsMobile(window.innerWidth <= 768);
          };
      
          // Set initial value on mount
          handleWindowSizeChange();

        window.addEventListener("resize", handleWindowSizeChange);
        return () => {
            window.removeEventListener("resize", handleWindowSizeChange);
        };
    }, []);

    return isMobile;
}

