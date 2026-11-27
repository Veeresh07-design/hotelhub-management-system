
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function CustomerRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{10,15}$/.test(formData.phone)) {
      setError("Enter a valid phone number (10–15 digits).");
      return;
    }

    try {
      setLoading(true);

      await api.post("/register", formData);

      alert("Registration successful! Please log in.");
      navigate("/customer/login");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white border border-[#eae7df] rounded-3xl shadow-lg px-7 py-10 sm:px-12">

        <div className="text-center mb-8">
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
            Create Your Account
          </h2>

          <p className="text-[#71808a] mt-2">
            Join HotelHub and experience comfortable stays.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#34434d] mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter your full name"
              value={formData.username}
              onChange={handleChange}
              minLength={2}
              required
              className="w-full bg-[#fcfbf8] border border-[#ded7ca] rounded-xl px-4 py-3.5 outline-none focus:border-[#c5a46d] focus:ring-2 focus:ring-[#c5a46d]/20 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434d] mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-[#fcfbf8] border border-[#ded7ca] rounded-xl px-4 py-3.5 outline-none focus:border-[#c5a46d] focus:ring-2 focus:ring-[#c5a46d]/20 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434d] mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter 10–15 digit phone number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full bg-[#fcfbf8] border border-[#ded7ca] rounded-xl px-4 py-3.5 outline-none focus:border-[#c5a46d] focus:ring-2 focus:ring-[#c5a46d]/20 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34434d] mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              maxLength={72}
              required
              className="w-full bg-[#fcfbf8] border border-[#ded7ca] rounded-xl px-4 py-3.5 outline-none focus:border-[#c5a46d] focus:ring-2 focus:ring-[#c5a46d]/20 transition"
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-7 text-sm text-[#71808a]">
          Already have an account?{" "}
          <Link
            to="/customer/login"
            className="text-[#a88650] font-bold hover:underline"
          >
            Login
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

export default CustomerRegister;
