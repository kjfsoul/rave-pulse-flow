import Layout from "@/components/Layout";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout title="404 - Not Found">
      <div className="min-h-screen flex items-center justify-center bg-bass-dark">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
          <p className="text-xl text-slate-400 mb-4">Oops! Page not found</p>
          <Link
            to="/"
            className="text-neon-cyan hover:text-neon-purple underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
