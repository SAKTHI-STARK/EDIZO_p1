import React, { useEffect, useState } from "react";
import { MapPin, ArrowLeft } from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import About from "./About";
import Contact from "./Contact";

interface DBBooking {
  id?: number;
  trackingCode: string;
  status: string;
  pickupCity?: string | null;
  pickupState?: string | null;
  dropoffCity?: string | null;
  dropoffState?: string | null;
  pickupAt?: string | null;
  createdAt?: string | null;
  price?: number;
  vehicleType?: string;
  receiverName?: string;
}

const API_BASE_URL = "http://localhost:8000/api";

const formatCityState = (city?: string | null, state?: string | null) => {
  const c = (city || "").trim();
  const s = (state || "").trim();
  if (c && s) return `${c}, ${s}`;
  return c || s || "—";
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "In Transit":
    case "Shipped":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

interface Props {
  onBack: () => void;
}

const RecentBookings: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<DBBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("redcap_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await axios.get(`${API_BASE_URL}/bookings`, { headers });
        setBookings(res.data?.bookings ?? res.data ?? []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-white text-gray-800 flex flex-col">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Header Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-white shadow-md rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="mt-2 text-gray-600">
              Track the status of your shipments and manage recent deliveries.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading your bookings...</p>
            </div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((b) => (
              <div
                key={b.id ?? b.trackingCode}
                className="border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-base leading-tight">
                        {formatCityState(b.pickupCity, b.pickupState)} →{" "}
                        {formatCityState(b.dropoffCity, b.dropoffState)}
                      </h3>

                      <dl className="mt-3 space-y-2 text-sm text-gray-600">
                        <div>
                          <dt className="font-medium">Date:</dt>
                          <dd>{formatDate(b.pickupAt || b.createdAt)}</dd>
                        </div>

                        <div>
                          <dt className="font-medium">Tracking ID:</dt>
                          <dd>
                            <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs text-gray-700">
                              {b.trackingCode}
                            </code>
                          </dd>
                        </div>

                        <div>
                          <dt className="font-medium">Status:</dt>
                          <dd>
                            <span
                              className={`inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full ${getStatusColor(
                                b.status
                              )}`}
                            >
                              {b.status}
                            </span>
                          </dd>
                        </div>

                        {b.price && (
                          <div>
                            <dt className="font-medium">Price:</dt>
                            <dd>${b.price.toFixed(2)}</dd>
                          </div>
                        )}

                        {b.vehicleType && (
                          <div>
                            <dt className="font-medium">Vehicle:</dt>
                            <dd>{b.vehicleType}</dd>
                          </div>
                        )}

                        {b.receiverName && (
                          <div>
                            <dt className="font-medium">Receiver:</dt>
                            <dd>{b.receiverName}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-red-100 to-transparent"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No bookings yet</h3>
            <p className="text-gray-500 mt-2">
              You haven't made any bookings. Start by creating a new shipment.
            </p>
          </div>
        )}
      </main>

      {/* Extra Sections */}
      <section className="mt-16">
        <About />
      </section>
      <section className="mt-16">
        <Contact />
      </section>
    </div>
  );
};

export default RecentBookings;
