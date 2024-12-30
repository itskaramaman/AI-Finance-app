"use client";

import React, { useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import useFetch from "@/hooks/useFetch";
import { scanReceipt } from "@/actions/transaction";
import { toast } from "sonner";

const ReceiptScanner = ({ onScanComplete }: { onScanComplete: () => void }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { loading, data, fn: fnScanReceipt } = useFetch(scanReceipt);

  const handleReceiptScan = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    await fnScanReceipt(file);
  };

  useEffect(() => {
    if (data && !loading) {
      onScanComplete(data);
      toast.success("Receipt scanned successfully");
    }
  }, [loading, data]);

  return (
    <div
      className="gradient rounded-md h-10 flex items-center justify-center cursor-pointer"
      onClick={() => fileInputRef.current?.click()}
    >
      {loading ? (
        <div className="flex gap-2 text-white items-center">
          <Loader2 className="animate-spin" />
          <p>Scanning...</p>
        </div>
      ) : (
        <div className="flex gap-2 text-white items-center">
          <Camera />
          <p>Scan Receipt with AI</p>
        </div>
      )}
      <Input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />
    </div>
  );
};

export default ReceiptScanner;
