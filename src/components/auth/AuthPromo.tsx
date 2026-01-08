'use client';

import { CheckCircle2, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function AuthPromotionalContent() {
    return (
        <div className="hidden relative lg:flex w-1/2 flex-col justify-center bg-[#050B1C] text-white p-16 overflow-hidden">
            {/* Subtle background effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] h-[40%] w-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-5%] left-[-5%] h-[30%] w-[30%] bg-primary/10 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            </div>

            <div className="relative z-10 max-w-lg">
                <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[10px] font-bold tracking-widest text-primary mb-8 uppercase">
                    START YOUR JOURNEY
                </div>

                <h2 className="text-5xl font-black leading-tight mb-6">
                    Unlock potential with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary">personalized learning.</span>
                </h2>

                <p className="text-lg text-gray-400 leading-relaxed mb-12">
                    Join a community of parents and learners transforming education through adaptive trails designed just for kids.
                </p>

                {/* Daily Challenge Card */}
                <div className="bg-[#0D1528] border border-white/5 rounded-3xl p-6 mb-12 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                            {/* Using an icon instead of emoji */}
                            <div className="h-6 w-6 bg-orange-500 rounded-lg flex items-center justify-center">
                                <span className="text-[10px] text-white font-bold">M</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">DAILY CHALLENGE</div>
                            <h4 className="text-lg font-bold mb-3">Math Safari Adventure</h4>
                            <div className="flex items-center gap-3">
                                <Progress value={75} className="h-1.5 flex-1 bg-white/5 [&>div]:bg-green-400" />
                                <span className="text-[10px] font-bold text-gray-400">75% Complete</span>
                            </div>
                        </div>
                    </div>
                    {/* Badge */}
                    <div className="absolute top-4 right-4 bg-white text-[#050B1C] text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        Fun for Kids!
                    </div>
                </div>

                {/* Social Proof */}
                <div className="flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-10 w-10 rounded-full border-2 border-[#050B1C] bg-gray-700 flex items-center justify-center text-[10px] font-bold">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                        <div className="h-10 w-10 rounded-full border-2 border-[#050B1C] bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                            +2k
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-sm font-bold">4.9/5</span>
                            <div className="flex text-yellow-400">
                                <Star className="h-3 w-3 fill-current" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium tracking-tight">rating from parents</p>
                    </div>
                </div>
            </div>

            {/* Footer absolute to parent if needed, or just at end of flow */}
            <div className="absolute bottom-8 left-16 text-[9px] text-gray-600 font-medium">
                © 2026 Obi Learning Inc. All rights reserved. <a href="#" className="underline ml-2">Privacy & Terms</a>
            </div>
        </div>
    );
}
