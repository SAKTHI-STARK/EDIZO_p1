import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const ForgetPassword: React.FC = () => {
  const { forgotPassword, error, clearError } = useAuth(); // ✅ use forgotPassword
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await forgotPassword(email); // ✅ call forgotPassword
      setMessage("Password reset link has been sent to your email.");
    } catch (err: any) {
      setMessage(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="w-80">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-3 py-2 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Send Reset Link
        </button>
      </form>
      {message && <p className="mt-3 text-green-600">{message}</p>}
      {error && <p className="mt-3 text-red-600">{error}</p>}
    </div>
  );
};

export default ForgetPassword;
