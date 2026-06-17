"use client";

import { Booking } from "@/lib/schema";
import { useState } from "react";

interface ReceiptGeneratorProps {
  booking: Booking;
  onGenerate?: () => void;
}

export default function ReceiptGenerator({
  booking,
  onGenerate,
}: ReceiptGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Prevent receipt generation for cancelled bookings
  if (booking.status === "cancelled") {
    return (
      <div className="text-center p-4">
        <p className="text-red-600 font-medium">
          Receipt cannot be generated for cancelled bookings.
        </p>
      </div>
    );
  }

  const generateImage = async () => {
    const element = document.getElementById("receipt-content");
    if (!element) return;

    setIsGenerating(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const fileName = `kwitansi-${booking.bookingId || booking.id}-${
        new Date().toISOString().split("T")[0]
      }.png`;

      // Make element visible for capture
      element.style.display = "block";
      element.style.position = "fixed";
      element.style.left = "50%";
      element.style.top = "50%";
      element.style.transform = "translate(-50%, -50%)";
      element.style.zIndex = "9999";

      // Wait for rendering
      await new Promise((resolve) => setTimeout(resolve, 200));

      try {
        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: "#050505",
          width: 600,
          height: element.scrollHeight,
        });

        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }, "image/png");
      } finally {
        // Hide element again
        element.style.display = "none";
        element.style.position = "absolute";
        element.style.left = "-9999px";
        element.style.top = "-9999px";
        element.style.transform = "none";
      }

      onGenerate?.();
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Gagal membuat kwitansi. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Hidden receipt content for image generation */}
      <div
        id="receipt-content"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          display: "none",
          width: "600px",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          color: "#ffffff",
          backgroundColor: "#050505",
        }}
      >
        <div
          style={{
            padding: "50px",
            backgroundColor: "#050505",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Grid Background Effect */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(20, 124, 96, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 124, 96, 0.08) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
              pointerEvents: "none",
            }}
          />

          {/* Decorative Glow */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "200px",
              height: "200px",
              background:
                "radial-gradient(circle, rgba(20, 124, 96, 0.15) 0%, transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          {/* Header */}
          <div
            style={{
              position: "relative",
              marginBottom: "40px",
              paddingBottom: "30px",
              borderBottom: "1px solid rgba(20, 124, 96, 0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: "900",
                    margin: "0 0 4px 0",
                    color: "#ffffff",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  BATAS KOTA
                </h1>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#147c60",
                    margin: "0",
                    fontWeight: "600",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    textShadow: "0 0 10px rgba(20, 124, 96, 0.5)",
                  }}
                >
                  The Town Space
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#147c60",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    textShadow: "0 0 8px rgba(20, 124, 96, 0.5)",
                  }}
                >
                  KWITANSI
                </span>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#9ca3af",
                    fontFamily: "monospace",
                    margin: "10px 0 0 0",
                  }}
                >
                  #{booking.bookingId || booking.id}
                </p>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "35px",
              position: "relative",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  color: "#6b7280",
                  letterSpacing: "2px",
                  marginBottom: "8px",
                }}
              >
                Diterima Dari
              </h3>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#ffffff",
                  margin: "0 0 4px 0",
                }}
              >
                {booking.teamName}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#9ca3af",
                  margin: "0",
                }}
              >
                {booking.phone}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <h3
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  color: "#6b7280",
                  letterSpacing: "2px",
                  marginBottom: "8px",
                }}
              >
                Tanggal
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#ffffff",
                  margin: "0",
                  fontWeight: "500",
                }}
              >
                {formatDate(
                  booking.approvedAt
                    ? new Date(booking.approvedAt).toISOString()
                    : new Date().toISOString()
                )}
              </p>
            </div>
          </div>

          {/* Booking Details Card */}
          <div
            style={{
              background: "#0a0a0a",
              border: "1px solid rgba(20, 124, 96, 0.2)",
              borderRadius: "8px",
              padding: "25px",
              marginBottom: "25px",
              position: "relative",
            }}
          >
            {/* Corner Brackets */}
            <div
              style={{
                position: "absolute",
                top: "-1px",
                left: "-1px",
                width: "20px",
                height: "20px",
                borderTop: "2px solid #147c60",
                borderLeft: "2px solid #147c60",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "-1px",
                right: "-1px",
                width: "20px",
                height: "20px",
                borderTop: "2px solid #147c60",
                borderRight: "2px solid #147c60",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-1px",
                left: "-1px",
                width: "20px",
                height: "20px",
                borderBottom: "2px solid #147c60",
                borderLeft: "2px solid #147c60",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-1px",
                right: "-1px",
                width: "20px",
                height: "20px",
                borderBottom: "2px solid #147c60",
                borderRight: "2px solid #147c60",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#ffffff",
                    margin: "0 0 8px 0",
                  }}
                >
                  Sewa Lapangan Mini Soccer
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#9ca3af",
                    margin: "0 0 4px 0",
                  }}
                >
                  {formatDate(booking.bookingDate)}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#147c60",
                    margin: "0",
                    fontWeight: "600",
                  }}
                >
                  {booking.timeSlot}
                </p>
                {(booking.addDokumentasi || booking.addWasit) && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#10b981", // lighter emerald
                      margin: "4px 0 0 0",
                      fontWeight: "500",
                    }}
                  >
                    + Add-On: {[
                      booking.addDokumentasi ? "Dokumentasi" : null,
                      booking.addWasit ? "Wasit" : null
                    ].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: "22px",
                    fontWeight: "800",
                    color: "#147c60",
                    margin: "0",
                    textShadow: "0 0 15px rgba(20, 124, 96, 0.4)",
                  }}
                >
                  Rp {booking.price.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          {/* Total Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 0",
              borderTop: "1px solid rgba(20, 124, 96, 0.2)",
              marginBottom: "30px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                color: "#9ca3af",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Total Pembayaran
            </span>
            <span
              style={{
                fontSize: "26px",
                fontWeight: "900",
                color: "#147c60",
                textShadow: "0 0 20px rgba(20, 124, 96, 0.5)",
              }}
            >
              Rp {booking.price.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Status Badge */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "rgba(20, 124, 96, 0.15)",
                border: "2px solid #147c60",
                padding: "12px 40px",
                borderRadius: "4px",
                boxShadow: "0 0 20px rgba(20, 124, 96, 0.3)",
                transform: "skewX(-15deg)",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "900",
                  color: "#147c60",
                  textTransform: "uppercase",
                  letterSpacing: "4px",
                  textShadow: "0 0 10px rgba(20, 124, 96, 0.5)",
                  display: "inline-block",
                  transform: "skewX(-15deg)",
                }}
              >
                LUNAS
              </span>
            </div>
          </div>

          {/* Fraud Warning */}
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              padding: "15px 20px",
              marginBottom: "25px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "#fca5a5",
                margin: "0 0 5px 0",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              ⚠️ PERINGATAN PENIPUAN
            </p>
            <p
              style={{
                fontSize: "10px",
                color: "#9ca3af",
                margin: "0",
                lineHeight: "1.5",
              }}
            >
              Pembayaran hanya transfer ke rekening atas nama <strong style={{ color: "#ffffff" }}>CV BATAS KOTA POINT</strong>. 
              Kami tidak bertanggung jawab atas transfer ke rekening lain atau atas nama pribadi.
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              paddingTop: "25px",
              borderTop: "1px solid rgba(20, 124, 96, 0.15)",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                fontWeight: "500",
                margin: "0 0 5px 0",
                letterSpacing: "1px",
              }}
            >
              Terima kasih atas kepercayaan Anda!
            </p>
            <p
              style={{
                fontSize: "10px",
                color: "#4b5563",
                margin: "0",
                fontFamily: "monospace",
              }}
            >
              bataskotapoint.com
            </p>
          </div>
        </div>
      </div>

      {/* Generate Button - Neon Style */}
      <div className="flex justify-center p-4">
        <button
          onClick={generateImage}
          disabled={isGenerating}
          className={`
            relative flex items-center gap-2 px-6 py-3 font-bold text-sm uppercase tracking-widest transition-all duration-300
            ${
              isGenerating
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                : "bg-neon-green/10 text-neon-green border border-neon-green hover:bg-neon-green hover:text-black hover:shadow-[0_0_30px_rgba(20,124,96,0.4)]"
            }
          `}
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
          }}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Download Kwitansi</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
