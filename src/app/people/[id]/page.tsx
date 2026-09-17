import React from "react";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tmdbClient } from "@/lib/tmdb";
import { imageService } from "@/services/imageService";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Star,
  Film,
  Award,
  Sparkles,
  Clapperboard,
} from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const person = await tmdbClient.getPersonDetails(id);
  if (!person) {
    return {
      title: "Person Not Found — Showara",
    };
  }
  return {
    title: `${person.name} — Filmography & Bio | Showara`,
    description: person.biography.slice(0, 160),
  };
}

export default async function PersonPage({ params }: PageProps) {
  const { id } = await params;
  const person = await tmdbClient.getPersonDetails(id);

  if (!person) {
    notFound();
  }

  const profileUrl = imageService.getProfileUrl(
    person.profilePath || person.profileUrl,
    "h632",
    person.name
  );

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors py-8 sm:py-12 pb-16 pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-safe pr-safe space-y-10">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/movies"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Movies</span>
          </Link>
        </div>

        {/* Hero / Profile Header */}
        <section className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--brand-primary)]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            {/* Profile Photo */}
            <div className="relative w-44 h-56 sm:w-52 sm:h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] shrink-0">
              <SafeImage
                src={person.profileUrl || person.profilePath}
                alt={person.name}
                type="profile"
                fallbackTitle={person.name}
                fill
                sizes="(max-width: 640px) 176px, 208px"
                className="object-cover object-top"
                priority
              />
            </div>

            {/* Profile Information */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-extrabold tracking-wider uppercase border border-[var(--brand-primary)]/20">
                  {person.knownForDepartment || "Actor"}
                </span>
                {person.popularity && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-500 text-xs font-semibold flex items-center gap-1 border border-amber-400/20">
                    <Sparkles className="w-3 h-3" />
                    <span>Popularity {person.popularity.toFixed(0)}</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">
                {person.name}
              </h1>

              {/* Vital Statistics Ribbon */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                {person.birthday && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>
                      Born: {new Date(person.birthday).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                )}
                {person.placeOfBirth && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>{person.placeOfBirth}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>{person.filmography?.length || 0} Featured Titles</span>
                </div>
              </div>

              {/* Biography */}
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Biography
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl whitespace-pre-line">
                  {person.biography || "Biography currently being updated."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filmography Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-2">
              <Clapperboard className="w-5 h-5 text-[var(--brand-primary)]" />
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                Filmography
              </h2>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-semibold">
              Showing {person.filmography?.length || 0} movies
            </span>
          </div>

          {person.filmography && person.filmography.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 min-w-0 w-full">
              {person.filmography.map((item, idx) => {
                const posterUrl = imageService.getPosterUrl(item.posterUrl, "w500", item.title);
                return (
                  <Link
                    key={`${item.id}-${idx}`}
                    href={`/movies/${item.slug}`}
                    className="group flex flex-col bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden hover:border-[var(--brand-primary)] hover:shadow-xl transition-all duration-300 w-full min-w-0"
                  >
                    {/* Poster */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--bg-surface-elevated)]">
                      <SafeImage
                        src={item.posterUrl}
                        alt={item.title}
                        type="poster"
                        fallbackTitle={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                      {/* Rating Badge */}
                      {item.rating > 0 && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{item.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Movie Info */}
                    <div className="p-3 flex flex-col flex-1 justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        {item.character && (
                          <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                            as {item.character}
                          </p>
                        )}
                      </div>

                      {item.releaseDate && (
                        <div className="text-[10px] text-[var(--text-secondary)] font-medium mt-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                          <span>{new Date(item.releaseDate).getFullYear() || "—"}</span>
                          <span className="text-[var(--brand-primary)] font-semibold group-hover:underline">
                            View Movie →
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)]">
              <Film className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[var(--text-secondary)]">
                No filmography available for this artist yet.
              </p>
            </div>
          )}
        </section>

        {/* TMDB Attribution notice */}
        <div className="pt-6 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
          Filmography, biography, and headshots provided courtesy of{" "}
          <span className="font-bold text-[var(--text-secondary)]">The Movie Database (TMDB)</span>.
        </div>
      </div>
    </div>
  );
}
