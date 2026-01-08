import { Sparkles } from "lucide-react";

export function WelcomeHero({ name }: { name: string }) {
    return (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary p-12 text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 anim-pulse"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Welcome to Obi Learning</span>
                </div>
                <h1 className="text-5xl font-black tracking-tight mb-4">
                    Hello, {name}!
                </h1>
                <p className="text-lg font-medium opacity-90 max-w-xl leading-relaxed">
                    Ready to explore new learning trails today? Orchestrate your students' journeys and manifest their curiosity.
                </p>
            </div>
        </div>
    );
}
