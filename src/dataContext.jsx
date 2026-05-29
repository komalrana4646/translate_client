import { useState, createContext, useContext } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}



export function DataProvider({ children }) {

 const [verify, setverify] = useState(false);

    const value = { verify, setverify };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}