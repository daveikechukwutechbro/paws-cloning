'use client'

const FootprintMap: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black animate-slide-up">
            <style>{`
                .fp-timeline { position: relative; padding: 18px 0 10px; }
                .fp-timeline::before {
                    content: "";
                    position: absolute; left: 50%; top: 0; bottom: 0; width: 3px; transform: translateX(-50%);
                    border-radius: 999px;
                    background: linear-gradient(180deg, #4c9ce2, #151516);
                }
                .fp-stage {
                    display: grid; grid-template-columns: 1fr 60px 1fr; gap: 14px; align-items: center; margin: 16px 0; position: relative;
                }
                .fp-stage.fp-left .fp-content { grid-column: 1; }
                .fp-stage.fp-left .fp-icon { grid-column: 2; }
                .fp-stage.fp-left .fp-blank { grid-column: 3; }
                .fp-stage.fp-right .fp-blank { grid-column: 1; }
                .fp-stage.fp-right .fp-icon { grid-column: 2; }
                .fp-stage.fp-right .fp-content { grid-column: 3; }

                .fp-blank { min-height: 10px; }
                .fp-content {
                    background: #ffffff0d;
                    border: 1px solid #2d2d2e;
                    border-radius: 16px;
                    padding: 16px 18px;
                }
                .fp-content h3 { margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #fefefe; }
                .fp-time {
                    display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #4c9ce2;
                    letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;
                }
                .fp-content p, .fp-content li { margin: 0; color: #868686; font-size: 14px; line-height: 1.6; }
                .fp-content ul { margin: 8px 0 0 16px; padding: 0; }
                .fp-content ul li { margin-bottom: 4px; }

                .fp-icon {
                    width: 60px; height: 60px; border-radius: 50%; display: grid; place-items: center; position: relative; margin: 0 auto;
                    background: linear-gradient(135deg, #4c9ce2, #80d0c7);
                    box-shadow: 0 0 12px rgba(76, 156, 226, 0.4);
                }
                .fp-paw { position: relative; width: 28px; height: 28px; }
                .fp-toe, .fp-pad { position: absolute; background: rgba(255,255,255,0.92); }
                .fp-toe { width: 7px; height: 10px; border-radius: 50%; }
                .fp-toe.fp-t1 { top: 0; left: 4px; transform: rotate(-18deg); }
                .fp-toe.fp-t2 { top: 0; right: 4px; transform: rotate(18deg); }
                .fp-toe.fp-t3 { top: 7px; left: 0; transform: rotate(-35deg); }
                .fp-toe.fp-t4 { top: 7px; right: 0; transform: rotate(35deg); }
                .fp-pad { width: 12px; height: 10px; border-radius: 50% 50% 44% 44%; left: 50%; top: 12px; transform: translateX(-50%); }

                .fp-phase { margin-top: 10px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
                .fp-badge {
                    background: rgba(76, 156, 226, 0.12); border: 1px solid rgba(76, 156, 226, 0.2); color: #4c9ce2;
                    border-radius: 12px; padding: 8px 10px; font-size: 12px; line-height: 1.4;
                }

                @media (max-width: 768px) {
                    .fp-timeline::before { left: 20px; transform: none; }
                    .fp-stage { grid-template-columns: 40px 1fr; gap: 10px; margin: 12px 0; }
                    .fp-stage .fp-icon { grid-column: 1; width: 40px; height: 40px; }
                    .fp-stage.fp-left .fp-content, .fp-stage.fp-right .fp-content { grid-column: 2; }
                    .fp-stage.fp-left .fp-blank, .fp-stage.fp-right .fp-blank { display: none; }
                    .fp-paw { width: 18px; height: 18px; }
                    .fp-toe { width: 5px; height: 7px; }
                    .fp-toe.fp-t1 { left: 2px; }
                    .fp-toe.fp-t2 { right: 2px; }
                    .fp-toe.fp-t3 { top: 4px; left: 0; }
                    .fp-toe.fp-t4 { top: 4px; right: 0; }
                    .fp-pad { width: 8px; height: 7px; top: 7px; }
                    .fp-icon { background: #151516; border: 1px solid #2d2d2e; box-shadow: none; }
                    .fp-phase { grid-template-columns: 1fr; }
                    .fp-content { padding: 12px 14px; }
                }
            `}</style>

            <div className="max-w-md mx-auto pt-[52px] pb-8 px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-[22px] font-bold text-[#fefefe] tracking-wide uppercase">PAWS Token Footprint Map</h1>
                        <p className="text-[#4c9ce2] text-[10px] tracking-widest uppercase mt-0.5">From Origin to Future</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-[#151516] text-[#868686]"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Timeline */}
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
    )
}

export default FootprintMap
