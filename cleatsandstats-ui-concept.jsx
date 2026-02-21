import { useState } from "react";

const GEAR_DATA = [
  { rank: 1, name: "Riddell SpeedFlex", type: "Helmet", stat: "12,847", unit: "rushing yds", change: "+342", players: 47, img: "🏈", color: "#FF6B35" },
  { rank: 2, name: "Nike Vapor Untouchable Pro 3", type: "Cleats", stat: "9,213", unit: "rushing yds", change: "+521", players: 38, img: "👟", color: "#00E5A0" },
  { rank: 3, name: "Schutt F7 2.0", type: "Helmet", stat: "8,991", unit: "rushing yds", change: "+198", players: 31, img: "🏈", color: "#4DA8FF" },
  { rank: 4, name: "Nike Vapor Edge Pro 360", type: "Cleats", stat: "7,456", unit: "rushing yds", change: "+277", players: 29, img: "👟", color: "#FF4D6A" },
  { rank: 5, name: "Xenith Shadow XR", type: "Helmet", stat: "6,102", unit: "rushing yds", change: "+155", players: 22, img: "🏈", color: "#B266FF" },
];

const WEEKLY_HIGHLIGHTS = [
  { label: "Most Rushing Yards", gear: "Riddell SpeedFlex", value: "2,341 yds", icon: "🏃" },
  { label: "Most TDs Caught", gear: "Nike Superbad 6.0 Gloves", value: "18 TDs", icon: "🧤" },
  { label: "Most FGs Made", gear: "Nike Vapor Edge", value: "14/15", icon: "🥾" },
  { label: "Most Passing Yards", gear: "Schutt F7 2.0", value: "4,102 yds", icon: "🎯" },
];

const TABS = ["Rushing", "Passing", "Receiving", "Kicking", "Defense"];
const GEAR_FILTERS = ["All Gear", "Helmets", "Cleats", "Gloves", "Visors"];

function StatCard({ highlight, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? "linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(20,20,28,1) 100%)"
          : "linear-gradient(135deg, rgba(30,30,42,1) 0%, rgba(20,20,28,1) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        padding: "24px",
        flex: "1",
        minWidth: "200px",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        animationName: "fadeSlideUp",
        animationDuration: "0.6s",
        animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        animationFillMode: "both",
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <div style={{ fontSize: "28px", marginBottom: "12px" }}>{highlight.icon}</div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>
        {highlight.label}
      </div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "28px", fontWeight: "700", color: "#FF6B35", marginBottom: "4px", letterSpacing: "-0.5px" }}>
        {highlight.value}
      </div>
      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
        {highlight.gear}
      </div>
      <div style={{
        position: "absolute",
        top: 0, right: 0,
        width: "80px", height: "80px",
        background: "radial-gradient(circle at top right, rgba(255,107,53,0.08) 0%, transparent 70%)",
        borderRadius: "0 16px 0 0",
      }} />
    </div>
  );
}

function LeaderboardRow({ item, index }) {
  const [hovered, setHovered] = useState(false);
  const barWidth = (parseInt(item.stat.replace(/,/g, "")) / 12847) * 100;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 20px",
        background: hovered ? "rgba(255,107,53,0.06)" : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        borderRadius: "8px",
        animationName: "fadeSlideUp",
        animationDuration: "0.5s",
        animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        animationFillMode: "both",
        animationDelay: `${0.3 + index * 0.08}s`,
      }}
    >
      <div style={{
        fontFamily: "'Oswald', sans-serif",
        fontSize: "24px",
        fontWeight: "700",
        color: item.rank <= 3 ? "#FF6B35" : "rgba(255,255,255,0.25)",
        width: "36px",
        textAlign: "center",
      }}>
        {item.rank}
      </div>

      <div style={{
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        background: `linear-gradient(135deg, ${item.color}22, ${item.color}08)`,
        border: `1px solid ${item.color}33`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        flexShrink: 0,
      }}>
        {item.img}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "15px", fontWeight: "600", color: "#fff" }}>
            {item.name}
          </span>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: item.color,
            background: `${item.color}15`,
            padding: "2px 8px",
            borderRadius: "4px",
          }}>
            {item.type}
          </span>
        </div>
        <div style={{ position: "relative", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: `${barWidth}%`,
            background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
            borderRadius: "2px",
            transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
          }} />
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "20px", fontWeight: "700", color: "#fff" }}>
          {item.stat}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1px" }}>
          {item.unit}
        </div>
      </div>

      <div style={{
        fontFamily: "'Barlow', sans-serif",
        fontSize: "13px",
        fontWeight: "600",
        color: "#00E5A0",
        background: "rgba(0,229,160,0.08)",
        padding: "4px 10px",
        borderRadius: "6px",
        flexShrink: 0,
      }}>
        {item.change}
      </div>

      <div style={{
        fontFamily: "'Barlow', sans-serif",
        fontSize: "12px",
        color: "rgba(255,255,255,0.4)",
        flexShrink: 0,
        width: "65px",
        textAlign: "right",
      }}>
        {item.players} players
      </div>

      <div style={{
        fontSize: "14px",
        color: "rgba(255,255,255,0.2)",
        transition: "all 0.3s ease",
        transform: hovered ? "translateX(3px)" : "translateX(0)",
        opacity: hovered ? 1 : 0.3,
      }}>→</div>
    </div>
  );
}

export default function CleatsAndStats() {
  const [activeTab, setActiveTab] = useState("Rushing");
  const [activeFilter, setActiveFilter] = useState("All Gear");
  const [timeRange, setTimeRange] = useState("Week 14");

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0D0D14 0%, #131320 50%, #0D0D14 100%)",
      color: "#fff",
      fontFamily: "'Barlow', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@400;500;600;700&display=swap');

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,107,53,0.3); border-radius: 3px; }
      `}</style>

      {/* Atmospheric background elements */}
      <div style={{
        position: "absolute", top: "-200px", right: "-200px",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(255,107,53,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-100px", left: "-100px",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(0,229,160,0.03) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* HEADER */}
      <header style={{
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        position: "relative",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #FF6B35, #FF4D6A)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px",
            boxShadow: "0 4px 20px rgba(255,107,53,0.3)",
          }}>⚡</div>
          <div>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "22px", fontWeight: "700", letterSpacing: "1px" }}>
              CLEATS
            </span>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "22px", fontWeight: "700", color: "#FF6B35", letterSpacing: "1px" }}>
              &
            </span>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "22px", fontWeight: "700", letterSpacing: "1px" }}>
              STATS
            </span>
          </div>
        </div>

        <nav style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          {["Leaderboard", "Matchups", "Players", "Shop"].map((item) => (
            <span key={item} style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: item === "Leaderboard" ? "#FF6B35" : "rgba(255,255,255,0.45)",
              cursor: "pointer",
              transition: "color 0.3s ease",
              fontWeight: "600",
            }}>
              {item}
            </span>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            animation: "pulse 2s ease-in-out infinite",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00E5A0" }} />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#00E5A0" }}>
              Live · Week 14
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 40px" }}>

        {/* Hero Section */}
        <div style={{
          marginBottom: "40px",
          animationName: "fadeSlideUp",
          animationDuration: "0.8s",
          animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          animationFillMode: "both",
        }}>
          <h1 style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: "48px",
            fontWeight: "700",
            lineHeight: "1.1",
            marginBottom: "8px",
            letterSpacing: "-0.5px",
          }}>
            WHICH GEAR
            <span style={{
              background: "linear-gradient(90deg, #FF6B35, #FF4D6A)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}> DOMINATES </span>
            THE FIELD?
          </h1>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "16px",
            color: "rgba(255,255,255,0.4)",
            maxWidth: "500px",
          }}>
            Real-time NFL stats ranked by the gear players wear. Updated every game day.
          </p>
        </div>

        {/* Weekly Highlight Cards */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "40px", flexWrap: "wrap" }}>
          {WEEKLY_HIGHLIGHTS.map((h, i) => (
            <StatCard key={i} highlight={h} index={i} />
          ))}
        </div>

        {/* Leaderboard Section */}
        <div style={{
          background: "linear-gradient(135deg, rgba(25,25,38,0.8) 0%, rgba(18,18,28,0.9) 100%)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "20px",
          overflow: "hidden",
          backdropFilter: "blur(20px)",
        }}>
          {/* Leaderboard Header */}
          <div style={{ padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "24px", fontWeight: "700", letterSpacing: "0.5px", marginBottom: "16px" }}>
                GEAR LEADERBOARD
              </h2>

              {/* Stat Category Tabs */}
              <div style={{ display: "flex", gap: "4px" }}>
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                      fontWeight: "600",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      background: activeTab === tab ? "rgba(255,107,53,0.15)" : "transparent",
                      color: activeTab === tab ? "#FF6B35" : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Gear Filter + Time Range */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {GEAR_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: "12px",
                    fontWeight: "500",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: activeFilter === f ? "1px solid rgba(255,107,53,0.4)" : "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    background: activeFilter === f ? "rgba(255,107,53,0.1)" : "transparent",
                    color: activeFilter === f ? "#FF6B35" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {f}
                </button>
              ))}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "12px",
                  fontWeight: "500",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,107,53,0.3)",
                  background: "rgba(255,107,53,0.08)",
                  color: "#FF6B35",
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              >
                <option value="Week 14">Week 14</option>
                <option value="Season 2025">Season 2025</option>
                <option value="Last 4 Weeks">Last 4 Weeks</option>
              </select>
            </div>
          </div>

          {/* Column Headers */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "16px 20px 8px",
            margin: "12px 8px 0",
          }}>
            <div style={{ width: "36px", textAlign: "center" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.2)" }}>#</span>
            </div>
            <div style={{ width: "44px" }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.2)" }}>Gear</span>
            </div>
            <div style={{ textAlign: "right", width: "80px" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.2)" }}>Total</span>
            </div>
            <div style={{ width: "65px", textAlign: "center" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.2)" }}>Δ Week</span>
            </div>
            <div style={{ width: "65px", textAlign: "right" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.2)" }}>Worn By</span>
            </div>
            <div style={{ width: "16px" }} />
          </div>

          {/* Leaderboard Rows */}
          <div style={{ padding: "0 8px 16px" }}>
            {GEAR_DATA.map((item, i) => (
              <LeaderboardRow key={i} item={item} index={i} />
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{
            padding: "20px 28px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
              Showing top 5 of 42 gear items
            </span>
            <button style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              fontWeight: "600",
              padding: "10px 24px",
              borderRadius: "10px",
              border: "1px solid rgba(255,107,53,0.3)",
              background: "rgba(255,107,53,0.08)",
              color: "#FF6B35",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}>
              View Full Leaderboard →
            </button>
          </div>
        </div>

        {/* Gear Matchup Teaser */}
        <div style={{
          marginTop: "32px",
          background: "linear-gradient(135deg, rgba(255,107,53,0.06) 0%, rgba(18,18,28,0.9) 50%, rgba(77,168,255,0.06) 100%)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "20px",
          padding: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          animationName: "fadeSlideUp",
          animationDuration: "0.6s",
          animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          animationFillMode: "both",
          animationDelay: "0.8s",
        }}>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🏈</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "18px", fontWeight: "700", color: "#FF6B35" }}>Riddell SpeedFlex</div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>12,847 rushing yds</div>
          </div>

          <div style={{ textAlign: "center", padding: "0 24px" }}>
            <div style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "3px",
              color: "rgba(255,255,255,0.25)",
              marginBottom: "4px",
            }}>
              Sunday Matchup
            </div>
            <div style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: "32px",
              fontWeight: "700",
              background: "linear-gradient(90deg, #FF6B35, #fff, #4DA8FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              VS
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "rgba(255,255,255,0.3)",
              marginTop: "4px",
            }}>
              Who wins this week?
            </div>
          </div>

          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🏈</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "18px", fontWeight: "700", color: "#4DA8FF" }}>Schutt F7 2.0</div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>8,991 rushing yds</div>
          </div>
        </div>

        {/* Shop CTA Banner */}
        <div style={{
          marginTop: "32px",
          background: "linear-gradient(90deg, rgba(255,107,53,0.12) 0%, rgba(255,77,106,0.08) 100%)",
          border: "1px solid rgba(255,107,53,0.15)",
          borderRadius: "16px",
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          animationName: "fadeSlideUp",
          animationDuration: "0.6s",
          animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          animationFillMode: "both",
          animationDelay: "1s",
        }}>
          <div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "18px", fontWeight: "700", marginBottom: "4px" }}>
              GEAR UP LIKE THE PROS
            </div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
              Shop the #1 ranked gear this season. Links to trusted retailers.
            </div>
          </div>
          <button style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            fontWeight: "700",
            padding: "12px 32px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #FF6B35, #FF4D6A)",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 4px 24px rgba(255,107,53,0.3)",
            transition: "all 0.3s ease",
            whiteSpace: "nowrap",
          }}>
            Shop Now →
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer style={{
        padding: "32px 40px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: "1200px",
        margin: "40px auto 0",
      }}>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
          © 2025 Cleats & Stats. Not affiliated with the NFL.
        </span>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
          Data updated weekly during NFL season
        </span>
      </footer>
    </div>
  );
}
