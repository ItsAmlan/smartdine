"use client";

import { ConciergeBell } from "lucide-react";
import { useState } from "react";
import GlassModal from "@/components/ui/GlassModal";
import GlassButton from "@/components/ui/GlassButton";

export default function CallStewardButton({ tableId }) {
  const [showModal, setShowModal] = useState(false);
  const [calling, setCalling] = useState(false);
  const [called, setCalled] = useState(false);

  const handleCall = async () => {
    setCalling(true);
    try {
      const res = await fetch("/api/steward-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, message: "Customer needs assistance" }),
      });
      if (res.ok) {
        setCalled(true);
        setTimeout(() => {
          setCalled(false);
          setShowModal(false);
        }, 3000);
      }
    } catch {
      // Handle silently
    } finally {
      setCalling(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
        title="Call Steward"
      >
        <ConciergeBell className="h-6 w-6" />
      </button>

      <GlassModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Call Steward"
        color="orange"
        size="sm"
      >
        {called ? (
          <div className="text-center py-4">
            <div className="text-green-600 text-lg font-semibold mb-2">
              ✅ Steward has been notified!
            </div>
            <p className="text-gray-500 text-sm">
              A steward will be at your table shortly.
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-6">
              Need assistance? A steward will come to your table.
            </p>
            <GlassButton
              onClick={handleCall}
              loading={calling}
              color="orange"
              fullWidth
            >
              Call Steward
            </GlassButton>
          </div>
        )}
      </GlassModal>
    </>
  );
}
