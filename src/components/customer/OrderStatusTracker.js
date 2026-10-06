"use client";

import { CheckCircle2, Clock, Truck, CreditCard, Package } from "lucide-react";

const steps = [
  { key: "PAID", label: "Payment Confirmed", icon: CreditCard },
  { key: "ACCEPTED", label: "Order Accepted", icon: CheckCircle2 },
  { key: "READY", label: "Ready for Pickup", icon: Package },
  { key: "DELIVERED", label: "Delivered", icon: Truck },
];

const statusIndex = {
  PAID: 0, PAUSED: 0, ACCEPTED: 1, READY: 2, DELIVERED: 3,
};

export default function OrderStatusTracker({ status, estimatedMinutes }) {
  const currentStep = statusIndex[status] ?? -1;

  return (
    <div className="space-y-4">
      {estimatedMinutes && currentStep === 1 && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <Clock className="h-5 w-5 text-orange-500" />
          <span className="text-orange-700 font-medium">
            Estimated time: {estimatedMinutes} minutes
          </span>
        </div>
      )}

      <div className="space-y-1">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCompleted
                      ? "bg-green-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-300"
                  } ${isCurrent ? "ring-2 ring-green-300 ring-offset-2" : ""}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-0.5 h-6 transition-all duration-500 ${
                    index < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`} />
                )}
              </div>

              <div className={`pb-6 ${index === steps.length - 1 ? "pb-0" : ""}`}>
                <p className={`font-medium text-sm ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-green-600 text-xs mt-0.5">Current Status</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
