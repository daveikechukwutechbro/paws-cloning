'use client'

const FootprintMap: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <style>{`
                .fp-root {
                    font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
                    background: radial-gradient(circle at top, #1e293b 0%, #0f172a 55%, #020617 100%);
                    color: #e5e7eb;
                    padding: 28px;
                }
                .fp-frame {
                    max-width: 1400px;
                    margin: 0 auto;
                    background: rgba(15, 23, 42, 0.8);
                    border: 1px solid rgba(148, 163, 184, 0.18);
                    border-radius: 28px;
                    padding: 28px;
                    box-shadow: 0 30px 80px rgba(0,0,0,0.35);
                    backdrop-filter: blur(8px);
                }
                .fp-hero {
                    background: linear-gradient(180deg, rgba(31,41,55,0.95), rgba(17,24,39,0.96));
                    border: 1px solid rgba(148,163,184,0.15);
                    border-radius: 24px;
                    padding: 22px;
                }
                .fp-h1 {
                    margin: 0 0 10px;
                    font-size: 34px;
                    line-height: 1.08;
                    letter-spacing: -0.03em;
                    font-weight: 700;
                }
                .fp-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
                .fp-chip {
                    border: 1px solid rgba(245,158,11,0.35);
                    color: #fde68a;
                    background: rgba(245,158,11,0.10);
                    border-radius: 999px;
                    padding: 8px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                }
                .fp-timeline { position: relative; padding: 18px 0 10px; }
                .fp-timeline::before {
                    content: "";
                    position: absolute; left: 50%; top: 0; bottom: 0; width: 4px; transform: translateX(-50%);
                    border-radius: 999px;
                    background: linear-gradient(180deg, #60a5fa, #f59e0b, #22c55e);
                    box-shadow: 0 0 18px rgba(96,165,250,0.22);
                }
                .fp-stage {
                    display: grid; grid-template-columns: 1fr 120px 1fr; gap: 18px; align-items: center; margin: 18px 0; position: relative;
                }
                .fp-stage.fp-left .fp-content { grid-column: 1; }
                .fp-stage.fp-left .fp-icon { grid-column: 2; }
                .fp-stage.fp-left .fp-blank { grid-column: 3; }
                .fp-stage.fp-right .fp-blank { grid-column: 1; }
                .fp-stage.fp-right .fp-icon { grid-column: 2; }
                .fp-stage.fp-right .fp-content { grid-column: 3; }

                .fp-blank { min-height: 10px; }
                .fp-content {
                    background: linear-gradient(180deg, rgba(31,41,55,0.96), rgba(15,23,42,0.98));
                    border: 1px solid rgba(148,163,184,0.14);
                    border-radius: 24px; padding: 20px 22px; min-height: 150px;
                    box-shadow: 0 14px 40px rgba(0,0,0,0.18);
                }
                .fp-content h3 { margin: 0 0 8px; font-size: 20px; }
                .fp-time {
                    display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;
                    letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; margin-bottom: 10px;
                }
                .fp-content p, .fp-content li { margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.65; }
                .fp-content ul { margin: 10px 0 0 18px; padding: 0; }

                .fp-icon {
                    width: 120px; height: 120px; border-radius: 50%; display: grid; place-items: center; position: relative; margin: 0 auto;
                    background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.22), rgba(255,255,255,0.04) 35%, rgba(0,0,0,0.10) 100%);
                    border: 1px solid rgba(255,255,255,0.12);
                    box-shadow: inset 0 0 24px rgba(255,255,255,0.03), 0 12px 30px rgba(0,0,0,0.25);
                }
                .fp-paw { position: relative; width: 62px; height: 62px; }
                .fp-toe, .fp-pad { position: absolute; background: rgba(255,255,255,0.92); box-shadow: inset -4px -4px 8px rgba(0,0,0,0.08); }
                .fp-toe { width: 16px; height: 22px; border-radius: 50%; }
                .fp-toe.fp-t1 { top: 0; left: 8px; transform: rotate(-18deg); }
                .fp-toe.fp-t2 { top: 0; right: 8px; transform: rotate(18deg); }
                .fp-toe.fp-t3 { top: 14px; left: 0; transform: rotate(-35deg); }
                .fp-toe.fp-t4 { top: 14px; right: 0; transform: rotate(35deg); }
                .fp-pad { width: 28px; height: 24px; border-radius: 50% 50% 44% 44%; left: 50%; top: 26px; transform: translateX(-50%); }

                .fp-phase { margin-top: 12px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
                .fp-badge {
                    background: rgba(96,165,250,0.10); border: 1px solid rgba(96,165,250,0.18); color: #dbeafe;
                    border-radius: 14px; padding: 10px 12px; font-size: 12px; line-height: 1.45;
                }

                @media (max-width: 980px) {
                    .fp-root { padding: 0; }
                    .fp-frame { border-radius: 0; border-left: none; border-right: none; padding: 20px 16px; }
                    .fp-hero { padding: 18px; }
                    .fp-h1 { font-size: 24px; }
                    .fp-timeline::before { left: 18px; transform: none; }
                    .fp-stage { grid-template-columns: 42px 1fr; gap: 12px; margin: 14px 0; }
                    .fp-stage .fp-icon { grid-column: 1; width: 42px; height: 42px; }
                    .fp-stage.fp-left .fp-content, .fp-stage.fp-right .fp-content { grid-column: 2; }
                    .fp-stage.fp-left .fp-blank, .fp-stage.fp-right .fp-blank { display: none; }
                    .fp-paw { width: 22px; height: 22px; }
                    .fp-toe { width: 6px; height: 10px; }
                    .fp-toe.fp-t1 { left: 3px; }
                    .fp-toe.fp-t2 { right: 3px; }
                    .fp-toe.fp-t3 { top: 5px; left: 0; }
                    .fp-toe.fp-t4 { top: 5px; right: 0; }
                    .fp-pad { width: 12px; height: 10px; top: 8px; }
                    .fp-icon { background: transparent; border: none; box-shadow: none; }
                    .fp-phase { grid-template-columns: 1fr; }
                    .fp-content { padding: 14px 16px; min-height: auto; }
                }
            `}</style>

            <div className="fp-root">
                <div className="fp-frame">
                    <div className="flex justify-between items-start mb-6">
                        <div className="fp-hero flex-1">
                            <h1 className="fp-h1">PAWS Token Footprint Map</h1>
                            <div className="fp-chips">
                                <span className="fp-chip">Origin to Present</span>
                                <span className="fp-chip">Second Mining Era</span>
                                <span className="fp-chip">Growth Milestones</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-4 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:bg-white/10"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="fp-timeline">
                        <div className="fp-stage fp-left">
                            <div className="fp-content">
                                <div className="fp-time">Phase 1 · Foundation</div>
                                <ul>
                                    <li>Basic game</li>
                                    <li>Mining updates</li>
                                    <li>Earn tasks</li>
                                </ul>
                            </div>
                            <div className="fp-icon"><div className="fp-paw"><div className="fp-toe fp-t1"></div><div className="fp-toe fp-t2"></div><div className="fp-toe fp-t3"></div><div className="fp-toe fp-t4"></div><div className="fp-pad"></div></div></div>
                            <div className="fp-blank"></div>
                        </div>

                        <div className="fp-stage fp-right">
                            <div className="fp-blank"></div>
                            <div className="fp-icon"><div className="fp-paw"><div className="fp-toe fp-t1"></div><div className="fp-toe fp-t2"></div><div className="fp-toe fp-t3"></div><div className="fp-toe fp-t4"></div><div className="fp-pad"></div></div></div>
                            <div className="fp-content">
                                <div className="fp-time">Phase 2 · Launch</div>
                                <ul>
                                    <li>TGE 1 successfully completed</li>
                                    <li>First phase of token utility activated</li>
                                    <li>Early ecosystem traction and visibility established</li>
                                </ul>
                            </div>
                        </div>

                        <div className="fp-stage fp-left">
                            <div className="fp-content">
                                <div className="fp-time">Phase 3 · Momentum</div>
                                <ul>
                                    <li>Beta users fully onboarded</li>
                                    <li>Performance improvements completed</li>
                                    <li>Partnerships and integrations expanded</li>
                                </ul>
                            </div>
                            <div className="fp-icon"><div className="fp-paw"><div className="fp-toe fp-t1"></div><div className="fp-toe fp-t2"></div><div className="fp-toe fp-t3"></div><div className="fp-toe fp-t4"></div><div className="fp-pad"></div></div></div>
                            <div className="fp-blank"></div>
                        </div>

                        <div className="fp-stage fp-right">
                            <div className="fp-blank"></div>
                            <div className="fp-icon"><div className="fp-paw"><div className="fp-toe fp-t1"></div><div className="fp-toe fp-t2"></div><div className="fp-toe fp-t3"></div><div className="fp-toe fp-t4"></div><div className="fp-pad"></div></div></div>
                            <div className="fp-content">
                                <div className="fp-time">Phase 4 · Present</div>
                                <h3>Second Mining Phase</h3>
                                <p>Active mining, strong engagement, and ecosystem readiness defining the current stage.</p>
                                <div className="fp-phase">
                                    <div className="fp-badge">Active mining</div>
                                    <div className="fp-badge">Community retention</div>
                                    <div className="fp-badge">Reward clarity</div>
                                    <div className="fp-badge">Transparency</div>
                                </div>
                            </div>
                        </div>

                        <div className="fp-stage fp-left">
                            <div className="fp-content">
                                <div className="fp-time">Phase 5</div>
                                <ul>
                                    <li>New utility features introduced</li>
                                    <li>User growth via targeted campaigns</li>
                                    <li>Consistent updates and reporting</li>
                                </ul>
                            </div>
                            <div className="fp-icon"><div className="fp-paw"><div className="fp-toe fp-t1"></div><div className="fp-toe fp-t2"></div><div className="fp-toe fp-t3"></div><div className="fp-toe fp-t4"></div><div className="fp-pad"></div></div></div>
                            <div className="fp-blank"></div>
                        </div>

                        <div className="fp-stage fp-right">
                            <div className="fp-blank"></div>
                            <div className="fp-icon"><div className="fp-paw"><div className="fp-toe fp-t1"></div><div className="fp-toe fp-t2"></div><div className="fp-toe fp-t3"></div><div className="fp-toe fp-t4"></div><div className="fp-pad"></div></div></div>
                            <div className="fp-content">
                                <div className="fp-time">Phase 6</div>
                                <ul>
                                    <li>Feature reveals and utility tease</li>
                                    <li>Incentive-driven ecosystem activity</li>
                                    <li>Liquidity expansion strategy</li>
                                </ul>
                            </div>
                        </div>

                        <div className="fp-stage fp-left">
                            <div className="fp-content">
                                <div className="fp-time">Phase 7</div>
                                <ul>
                                    <li>TGE 2 successfully completed</li>
                                    <li>Broader liquidity and trading access achieved</li>
                                </ul>
                            </div>
                            <div className="fp-icon"><div className="fp-paw"><div className="fp-toe fp-t1"></div><div className="fp-toe fp-t2"></div><div className="fp-toe fp-t3"></div><div className="fp-toe fp-t4"></div><div className="fp-pad"></div></div></div>
                            <div className="fp-blank"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FootprintMap
