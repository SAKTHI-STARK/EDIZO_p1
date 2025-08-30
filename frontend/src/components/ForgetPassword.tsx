import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, Mail } from "lucide-react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api"; // Ensure the URL is correct

const ForgetPassword: React.FC = () => {
  const { forgotPassword, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to check if email exists in the backend
  const checkEmailExists = async (email: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
      // Check if the response data indicates success
      if (response.data.success) {
        return true; // Email exists
      } else {
        return false; // Email doesn't exist
      }
    } catch (err) {
      console.error("Error checking email:", err);
      return false; // Treat errors as email not found
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setMessage(""); // Clear previous messages
    setLoading(true);

    // Check if the email exists in the database
    const doesExist = await checkEmailExists(email);
    if (!doesExist) {
      setMessage("❌ This email is not registered.");
      setLoading(false);
      return; // Stop the process if the email doesn't exist
    }

    try {
      // Attempt to send the reset password link
      await forgotPassword(email);
      setMessage("✅ Password reset link has been sent to your email.");
    } catch (err: any) {
      // Handle any errors during the process
      setMessage(err?.message || "❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back button */}
        <button
          onClick={() => window.history.back()} // Go back to previous page
          className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-600 text-sm mt-1">
              Enter your registered email address to receive a reset link.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Message */}
            {message && (
              <p
                className={`text-sm text-center ${
                  message.startsWith("✅") ? "text-green-600" : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
