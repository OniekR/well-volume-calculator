import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Loading from "./components/ui/Loading";
import { lazyLoad } from "./utils/lazyLoad";

const Home = lazyLoad(() => import("./pages/Home"));
const WellBuilderPage = lazyLoad(() => import("./pages/WellBuilderPage"));
const WellVolumeCalculator = lazyLoad(() =>
  import("./pages/calculators/WellVolumeCalculator"),
);
const CementCalculator = lazyLoad(() => import("./pages/calculators/CementCalculator"));
const PressureTestCalculator = lazyLoad(() => import("./pages/calculators/PressureTestCalculator"));
const FluidFlowCalculator = lazyLoad(() => import("./pages/calculators/FluidFlowCalculator"));
const StringLiftCalculator = lazyLoad(() => import("./pages/calculators/StringLiftCalculator"));
const UiTest = lazyLoad(() => import("./pages/UiTest"));

const App = () => {
  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<WellBuilderPage />} />
          <Route path="/calculators/volumes" element={<WellVolumeCalculator />} />
          <Route path="/calculators/cement" element={<CementCalculator />} />
          <Route path="/calculators/pressure" element={<PressureTestCalculator />} />
          <Route path="/calculators/flow" element={<FluidFlowCalculator />} />
          <Route path="/calculators/lift" element={<StringLiftCalculator />} />
          <Route path="/ui-test" element={<UiTest />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

export default App;
