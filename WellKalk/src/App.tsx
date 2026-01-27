import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import WellBuilderPage from "./pages/WellBuilderPage";
import WellVolumeCalculator from "./pages/calculators/WellVolumeCalculator";
import CementCalculator from "./pages/calculators/CementCalculator";
import PressureTestCalculator from "./pages/calculators/PressureTestCalculator";
import FluidFlowCalculator from "./pages/calculators/FluidFlowCalculator";
import StringLiftCalculator from "./pages/calculators/StringLiftCalculator";
import UiTest from "./pages/UiTest";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<WellBuilderPage />} />
        <Route path="/calculators/volumes" element={<WellVolumeCalculator />} />
        <Route path="/calculators/cement" element={<CementCalculator />} />
        <Route
          path="/calculators/pressure"
          element={<PressureTestCalculator />}
        />
        <Route path="/calculators/flow" element={<FluidFlowCalculator />} />
        <Route path="/calculators/lift" element={<StringLiftCalculator />} />
        <Route path="/ui-test" element={<UiTest />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
