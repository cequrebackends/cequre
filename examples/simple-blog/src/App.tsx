import "./index.css";
import { onSettled, Loading } from "solid-js";
import { Router } from "./router";
import { Title } from "@solidjs/meta";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { initAuth } from "./lib/auth";

function App() {
  onSettled(() => {
    initAuth();
  });

  return (
    <Router>
      {(props) => (
        <div class="min-h-screen flex flex-col bg-paper text-stone-900 selection:bg-amber-200 selection:text-stone-900">
          <Title>Chronicle — Technical & Architecture Journal</Title>
          <Navbar />
          <main class="flex-1 w-full">
            <Loading
              fallback={
                <div class="min-h-[50vh] flex items-center justify-center">
                  <div class="flex items-center gap-3 font-mono text-xs text-stone-500">
                    <span class="inline-block w-2 h-2 rounded-full bg-stone-900 animate-ping" />
                    Loading Chronicle...
                  </div>
                </div>
              }
            >
              {props.children}
            </Loading>
          </main>
          <Footer />
        </div>
      )}
    </Router>
  );
}

export default App;
