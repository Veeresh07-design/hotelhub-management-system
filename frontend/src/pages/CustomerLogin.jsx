
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function CustomerLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (response.data.role !== "customer") {
        setError("This login page is for customers only.");
        return;
      }

      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("user_role", response.data.role);
      localStorage.setItem("username", response.data.username);

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white border border-[#eae7df] rounded-3xl shadow-lg px-7 py-10 sm:px-12">

        <div className="text-center mb-9">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#c5a46d] flex items-center justify-center text-[#172b36] text-3xl font-bold mb-5">
            H
          </div>

          <h1 className="text-3xl font-bold text-[#172b36]">
            HotelHub
          </h1>

          <p className="text-xs tracking-[3px] text-[#a88650] mt-2">
            HOSPITALITY MANAGEMENT
          </p>

          <h2 className="text-xl font-semibold text-[#203641] mt-6">
            Welcome Back
          </h2>

          <p className="text-[#71808a] mt-2">
            Login to your customer account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#34434d] mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#fcfbf8] border border-[#ded7ca] rounded-xl px-4 py-4 outline-none focus:border-[#c5a46d] focus:ring-2 focus:ring-[#c5a46d]/20 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434d] mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#fcfbf8] border border-[#ded7ca] rounded-xl px-4 py-4 outline-none focus:border-[#c5a46d] focus:ring-2 focus:ring-[#c5a46d]/20 transition"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c5a46d] hover:bg-[#d4b781] text-[#172b36] font-semibold py-4 rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login to Account"}
          </button>
        </form>

        <div className="text-center mt-7 text-sm text-[#71808a]">
          Don't have an account?{" "}
          <Link
            to="/customer/register"
            className="text-[#a88650] font-bold hover:underline"
          >
            Register Now
          </Link>
        </div>

        <div className="text-center mt-8 pt-6 border-t border-[#eee9df]">
          <Link
            to="/"
            className="text-sm text-[#71808a] hover:text-[#a88650] transition"
          >
            ← Back to Home
          </Link>
        </div>

        <p className="text-center text-xs text-[#9aa3a8] mt-7">
          © 2026 HotelHub. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default CustomerLogin;
