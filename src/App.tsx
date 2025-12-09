import { OnebriefHero } from "./components/OnebriefHero";

function App() {
  return (
    <>
      <OnebriefHero
        title={["Prepare", "Globally."]}
        subtitle="See how the Onebrief platform can empower your military logistics planning in hours, not weeks."
        showDebugControls={true}
      />

      {/* Additional content below hero */}
      <div className="px-20 md:px-60 py-60 bg-surface-primary">
        <div className="container mx-auto">
          <p className="font-body text-[var(--text-16)] text-text-secondary">
            Scroll down for more content...
          </p>
        </div>
      </div>
    </>
  );
}

export default App;
