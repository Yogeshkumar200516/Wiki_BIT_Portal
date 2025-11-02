import React from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppLayout from "./AppLayout/AppLayout";

function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

export default App;
