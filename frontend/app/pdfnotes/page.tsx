"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/doFetch";
import { Download, FileText, Search } from "lucide-react";
import OfferPopup from "@/components/LandingComponents/OfferPopup";

type Pdf = {
  id: number;
  title: string;
  file_url: string;
  created_at: string;
};

type PdfResponse = {
  message: string;
  pdfs: Pdf[];
};

type WhatsAppResponse = {
  success: boolean;
  message?: string;
};

export default function PdfNotesPage() {
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(true);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const res = (await fetchApi.get("api/free-pdfs/all")) as PdfResponse;
        const sorted = (res.pdfs || []).sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        setPdfs(sorted);
      } catch (err) {
        console.error("Error fetching PDFs:", err);
        setError("Failed to load notes. Please try again later.");
      }
    };
    fetchPdfs();
  }, []);


  const handleViewClick = async (fileUrl: string) => {
    try {
      const res = (await fetchApi.get("api/users/whatsapp/check")) as WhatsAppResponse;

      if (res.success) {
        window.open(fileUrl, "_blank");
      } else {
        setSelectedPdf(fileUrl);
        setShowForm(true);
      }
    } catch (err) {
      console.error("Check API Error:", err);
      if (err instanceof Error) {
        if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
          alert("Please login first to view or download this note.");
        } else if (err.message?.includes("Phone") || err.message?.includes("Name")) {
          setSelectedPdf(fileUrl);
          setShowForm(true);
        } else {
          alert("Something went wrong, please try again.");
        }
      }
    }
  };


  //Submit name + phone
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("Please fill all fields");
      return;
    }

    // Phone number validation: only digits, 
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid phone number (only digits).");
      return;
    }

    if (!agree) {
      alert("Please agree to the Terms & Conditions and Privacy Policy.");
      return;
    }

    if (!whatsappConsent) {
      alert("Please agree to receive WhatsApp updates before continuing.");
      return;
    }

    setLoading(true);
    try {
      const res = (await fetchApi.put("api/users/whatsapp/update", {
        name,
        phone,
      })) as WhatsAppResponse;

      if (res.success) {
        setShowForm(false);
        setName("");
        setPhone("");
        setAgree(false);
        if (selectedPdf) window.open(selectedPdf, "_blank");
      } else {
        alert(res.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Update API Error:", err);
      alert("Error saving info");
    } finally {
      setLoading(false);
    }
  };

  const filteredPdfs = pdfs.filter((pdf) =>
    pdf.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error)
    return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center text-violet-700">
        Lecture Notes
      </h1>

      {/* Search */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>


      {filteredPdfs.length === 0 ? (
        <p className="text-center text-gray-600">No notes found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="group p-5 border rounded-xl shadow-md bg-white hover:shadow-xl hover:scale-105 transform transition duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="text-violet-600 w-6 h-6" />
                <h2 className="font-semibold text-lg text-gray-800">
                  {pdf.title}
                </h2>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Uploaded on{" "}
                <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-md text-xs">
                  {new Date(pdf.created_at).toLocaleDateString()}
                </span>
              </p>

              <button
                onClick={() => handleViewClick(pdf.file_url)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-violet-700 text-white rounded-lg hover:bg-violet-600 transition"
              >
                <Download className="w-4 h-4" /> View / Download
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Popup Form */}
      {showForm && (
        <div className="fixed inset-0  flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative border-2 border-violet-700">
            <h2 className="text-xl font-semibold mb-4 text-violet-700">
              Enter Your Details
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="text"
                placeholder="WhatsApp Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500"
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                I agree to the Terms & Conditions and Privacy Policy.
              </label>

              <label className="text-sm flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={whatsappConsent}
                  onChange={(e) => setWhatsappConsent(e.target.checked)}
                  required
                />
                I agree to receive WhatsApp updates about this material from Tending To Infinity Academy.
              </label>


              <button
                type="submit"
                disabled={loading}
                className="bg-violet-700 text-white py-2 rounded-lg hover:bg-violet-600"
              >
                {loading ? "Saving..." : "Submit & Continue"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <OfferPopup
        imageSrc="/images/popup2.png"
        title="Bumper Offer – All-in-One Course Bundle!"
        description="Boost your engineering journey with our special bundles!"
      />
    </div>
  );
}
