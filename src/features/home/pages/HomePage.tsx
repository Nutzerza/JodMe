import Image from "next/image";
import { features, animeCovers } from "@/features/home/constants";
import { AnimatedCards } from "@/shared/components/AnimatedCards";
import logo from "@/shared/images/logo.png";
import { Button } from "@/shared/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";
export function HomePage() {
  return (
    <>
      <section className="container mx-auto px-6 py-20 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-full flex items-center justify-center mb-8">
            <Image
              src={logo}
              alt="JodMe logo"
              width={300}
              height={300}
              className="pointer-events-none"
              loading="eager"
            />
          </div>

          <h1 className="text-6xl font-bold mb-6 bg-linear-to-r from-sky-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
            Manage your anime list in one place
          </h1>

          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Save, track, and analyze the anime you watch with search, seasonal
            browsing, progress tracking, and stats.
          </p>

          <div className="flex justify-center gap-4">
            <Link href="/auth">
              {/* session?.user ? "/me" : "/auth" */}
              <Button
                size="lg"
                className="bg-linear-to-r from-sky-600 to-teal-500"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start for free
                {/* {session?.user ? "Open My List" : "Start for free"} */}
              </Button>
            </Link>
          </div>
        </div>

        <AnimatedCards covers={animeCovers} />
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
          <p className="text-slate-400">
            Browse publicly, then log in when you are ready to save.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-sky-950/30 rounded-xl p-6 border border-sky-800/40 hover:scale-105 transition"
            >
              <div className="w-12 h-12 bg-teal-500/15 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-8 text-slate-400 text-sm">
        Copyright 2026 JodMe. Anime data from AniList API.
      </footer>
    </>
  );
}
