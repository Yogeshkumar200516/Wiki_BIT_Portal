import React from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ComplaintProvider } from "./context/ComplaintContext.jsx";
import { FacultyscoreProvider } from "./context/FacultyscoreContext.jsx";
import AppLayout from "./AppLayout/AppLayout";

function App() {
  return (
    <AuthProvider>
      <ComplaintProvider>
        <FacultyscoreProvider>
          <AppLayout />
        </FacultyscoreProvider>
      </ComplaintProvider>
    </AuthProvider>
  );
}

export default App;