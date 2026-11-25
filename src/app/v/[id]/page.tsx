import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VideoScreen } from "@/components/video-screen";
import { getVideo, videos } from "@/data/catalogue";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return videos.map((video) => ({ id: video.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const video = getVideo(id);
  if (!video) return { title: "Public Record" };
  return {
    title: video.title,
    description: `${video.channel} · YouTube`,
  };
}

export default async function VideoPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const video = getVideo(id);
  if (!video) notFound();
  return (
    <Suspense>
      <VideoScreen video={video} />
    </Suspense>
  );
}
