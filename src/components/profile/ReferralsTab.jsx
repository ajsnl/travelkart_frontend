import React, { useEffect, useState } from "react";
import { Copy, Check, Gift, Share2, Award, Users, Wallet, CheckCircle } from "lucide-react";
import { getReferralStats } from "../../services/authService";
import { toast } from "react-toastify";

const ReferralsTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getReferralStats();
        setStats(res.data);
      } catch (err) {
        console.error("Error loading referral stats:", err);
        toast.error("Failed to load referral details.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleCopyCode = () => {
    if (!stats?.referral_code) return;
    navigator.clipboard.writeText(stats.referral_code);
    setCopiedCode(true);
    toast.success("Referral code copied! ");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!stats?.referral_url) return;
    navigator.clipboard.writeText(stats.referral_url);
    setCopiedLink(true);
    toast.success("Sharing link copied! ");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading referrals...</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="referral-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      <div className="referral-banner-hero" style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: "16px",
        padding: "32px 24px",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)",
          borderRadius: "50%"
        }} />
        
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div style={{
            background: "rgba(99, 102, 241, 0.15)",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid rgba(99, 102, 241, 0.2)"
          }}>
            <Gift size={28} style={{ color: "#818cf8" }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 8px 0", letterSpacing: "-0.025em" }}>
              Invite & Earn ₹99 + Gold Days
            </h2>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
              Share your referral code. When your friends sign up and place their first order (minimum value ₹100), you get ₹99 in wallet + 3 days Gold Membership (if not already gold). They get ₹50 in wallet!
            </p>
          </div>
        </div>
      </div>

      {/* CODE & LINK SHARING SECTION */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "16px"
      }}>
        {/* REFERRAL CODE BOX */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Your Referral Code
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{
              flex: 1,
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "10px 14px",
              fontFamily: "monospace",
              fontSize: "18px",
              fontWeight: "700",
              color: "#0f172a",
              letterSpacing: "0.1em",
              textAlign: "center"
            }}>
              {stats.referral_code}
            </div>
            <button 
              onClick={handleCopyCode}
              style={{
                background: "#6366f1",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "0 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
            >
              {copiedCode ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        {/* SHARE LINK BOX */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Sharing Link
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              readOnly
              value={stats.referral_url}
              style={{
                flex: 1,
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "13px",
                color: "#475569",
                outline: "none"
              }}
            />
            <button 
              onClick={handleCopyLink}
              style={{
                background: "#0f172a",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "0 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
            >
              {copiedLink ? <Check size={18} /> : <Share2 size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px"
      }}>
        {/* REFERRED */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          <div style={{ padding: "10px", borderRadius: "10px", background: "#eff6ff", color: "#3b82f6" }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>
              {stats.referrals.length}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>Invited Friends</div>
          </div>
        </div>

        {/* EARNINGS */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          <div style={{ padding: "10px", borderRadius: "10px", background: "#f0fdf4", color: "#22c55e" }}>
            <Wallet size={22} />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>
              ₹{stats.total_earned}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>Total Wallet Earned</div>
          </div>
        </div>

        {/* GOLD DAYS */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          <div style={{ padding: "10px", borderRadius: "10px", background: "#fffbeb", color: "#fbbf24" }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>
              +{stats.gold_days_earned}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>Gold Days Earned</div>
          </div>
        </div>
      </div>

      {/* REFERRAL HISTORY & STATUS TRACKER */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "20px",
      }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 16px 0" }}>
          Referred Friends
        </h3>

        {stats.referrals.length === 0 ? (
          <p style={{ color: "#64748b", margin: 0, fontSize: "14px", padding: "12px 0" }}>
            No friends referred yet. Share your code to get started!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {stats.referrals.map((ref) => {
              const getStatusColor = (status) => {
                if (status === "rewarded") return "#22c55e";
                if (status === "first_order") return "#3b82f6";
                return "#f97316";
              };

              return (
                <div key={ref.id} style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}>
                  {/* Info Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                        {ref.username}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        {ref.email} • Joined on {new Date(ref.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 8px",
                      borderRadius: "9999px",
                      background: `${getStatusColor(ref.status)}15`,
                      color: getStatusColor(ref.status),
                      textTransform: "uppercase"
                    }}>
                      {ref.status_display}
                    </span>
                  </div>

                  {/* STEPPER STATUS FLOW PROGRESS */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 8px",
                    position: "relative"
                  }}>
                    {/* Background Progress Line */}
                    <div style={{
                      position: "absolute",
                      left: "30px",
                      right: "30px",
                      height: "3px",
                      background: "#e2e8f0",
                      zIndex: 1
                    }} />

                    {/* Active Progress Line */}
                    <div style={{
                      position: "absolute",
                      left: "30px",
                      width: ref.status === "rewarded" ? "calc(100% - 60px)" : ref.status === "first_order" ? "50%" : "0%",
                      height: "3px",
                      background: "#6366f1",
                      zIndex: 2,
                      transition: "all 0.3s ease"
                    }} />

                    {/* Step 1: Signed Up */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3, gap: "4px" }}>
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "#6366f1",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}>
                        ✓
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}>Signed Up</span>
                    </div>

                    {/* Step 2: First Order */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3, gap: "4px" }}>
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: (ref.status === "first_order" || ref.status === "rewarded") ? "#6366f1" : "#e2e8f0",
                        color: (ref.status === "first_order" || ref.status === "rewarded") ? "#ffffff" : "#64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}>
                        {(ref.status === "first_order" || ref.status === "rewarded") ? "✓" : "2"}
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: (ref.status === "first_order" || ref.status === "rewarded") ? "#475569" : "#94a3b8" }}>
                        First Order
                      </span>
                    </div>

                    {/* Step 3: Rewarded */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3, gap: "4px" }}>
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: ref.status === "rewarded" ? "#22c55e" : "#e2e8f0",
                        color: ref.status === "rewarded" ? "#ffffff" : "#64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}>
                        {ref.status === "rewarded" ? <CheckCircle size={14} /> : "3"}
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: ref.status === "rewarded" ? "#22c55e" : "#94a3b8" }}>
                        Rewarded
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ReferralsTab;
