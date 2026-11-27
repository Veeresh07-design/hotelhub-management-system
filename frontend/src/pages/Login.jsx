
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("access_token", response.data.access_token);

      alert("Login Successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white border border-[#EAE7DF] shadow-xl rounded-2xl p-8 md:p-10">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#C5A46D] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-[#172B36]">H</span>
          </div>

          <h1 className="text-3xl font-bold text-[#172B36]">
            HotelHub
          </h1>

          <p className="text-xs tracking-[3px] uppercase text-[#A18453] mt-2">
            Hospitality Management
          </p>

          <p className="text-gray-500 mt-3">
            Admin Login
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#DED9CE] bg-[#FCFBF8] rounded-lg px-4 py-3.5 text-[#172B36] outline-none focus:border-[#C5A46D] focus:ring-2 focus:ring-[#C5A46D]/20 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434D] mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#DED9CE] bg-[#FCFBF8] rounded-lg px-4 py-3.5 text-[#172B36] outline-none focus:border-[#C5A46D] focus:ring-2 focus:ring-[#C5A46D]/20 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C5A46D] text-[#172B36] py-3.5 rounded-lg font-semibold hover:bg-[#D4B781] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
          © 2026 HotelHub. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
