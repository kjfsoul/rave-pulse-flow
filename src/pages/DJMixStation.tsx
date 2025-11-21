import Layout from "@/components/Layout";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { SimpleDJStation } from '@/components/SimpleDJStation';

const DJMixStation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to pro studio after a short delay
    const timer = setTimeout(() => {
      navigate("/pro-dj-station", { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Layout title="Redirecting...">
      <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-center mb-4">
          Redirecting to Pro Studio...
        </h1>
        <p className="text-center mt-4 text-gray-300">
          Please wait while we redirect you to the Professional DJ Station
        </p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
      {/* REMOVE <BottomNavigation /> */}
    </Layout>
  );
};

export default DJMixStation;
