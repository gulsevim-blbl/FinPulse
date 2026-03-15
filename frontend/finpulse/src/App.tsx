import AppRouter from "./router/AppRouter";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors theme="light" />
      <AppRouter />
    </>
  );
}

export default App;