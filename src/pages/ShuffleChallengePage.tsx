import Layout from "@/components/Layout";
import ShuffleChallenge from "@/components/ShuffleChallenge";
import React from "react";
import { useNavigate } from "react-router-dom";

const ShuffleChallengePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout title="Shuffle Challenge">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        {/* REMOVE the custom header section (lines 14-31) */}

        {/* Challenge Component */}
        <div className="relative z-10">
          <ShuffleChallenge onClose={() => navigate("/")} />
        </div>
      </div>
      {/* REMOVE <BottomNavigation /> */}
    </Layout>
  );
};

export default ShuffleChallengePage;
