import Layout from "./components/layout/Layout";

const App = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Well Calculator</h1>
        <p className="mt-3 text-[var(--eq-text-muted)]">
          Project scaffold ready. Continue with Step 2.
        </p>
      </div>
    </Layout>
  );
};

export default App;