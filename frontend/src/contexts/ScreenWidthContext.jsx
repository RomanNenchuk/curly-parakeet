import React, { createContext, useContext, useState, useEffect } from "react";

const ScreenWidthContext = createContext();

export const ScreenWidthProvider = ({ children }) => {
    const [width, setWidth] = useState(window.innerWidth); // Виправлено тут

    useEffect(() => {
        const updateWidth = () => setWidth(window.innerWidth); // Виправлено тут
        window.addEventListener("resize", updateWidth);
        
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    return (
        <ScreenWidthContext.Provider value={{ width }}>
            {children}
        </ScreenWidthContext.Provider>
    );
};

export const useWidth = () => useContext(ScreenWidthContext);
