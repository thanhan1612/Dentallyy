import { useState, useEffect } from "react";
import {
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import Step1Account from "./Step1Account";
import Step2PersonalInfo from "./Step2PersonalInfo";
import { useModal } from "@/contexts/modal-context";

export default function ModalEmployee() {
  const [currentStep, setCurrentStep] = useState(0);
  const { modalData } = useModal();

  // Reset step when modal closes
  useEffect(() => {
    if (!modalData) {
      setCurrentStep(0);
    }
  }, [modalData]);

  const steps = [
    {
      title: "Account Information",
      content: <Step1Account onNext={handleAccountSubmit} />,
    },
    {
      title: "Personal Information",
      content: <Step2PersonalInfo onSubmit={handlePersonalInfoSubmit} onBack={handleBack} />,
    },
  ];

  function handleAccountSubmit(values: any) {
    setCurrentStep(1);
  }

  function handleBack() {
    setCurrentStep(0);
  }

  function handlePersonalInfoSubmit(values: any) {
    setCurrentStep(0);
  }

  return (
    <>
    <div className="flex flex-col gap-2">
      <DialogTitle>Add New Employee</DialogTitle>
      <DialogDescription>
        Please fill in the following information to add a new employee.
      </DialogDescription>
    </div>
      <div className="space-y-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`flex items-center ${
                  index !== steps.length - 1 ? "flex-1" : ""
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                    index <= currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/25"
                  }`}
                >
                  {index + 1}
                </div>
                {index !== steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      index < currentStep
                        ? "bg-primary"
                        : "bg-muted-foreground/25"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">{steps[currentStep].content}</div>
        </div>
    </>
  );
}

