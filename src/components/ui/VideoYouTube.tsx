export function VideoYouTube({ id, titulo }: { id: string; titulo: string }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={titulo}
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
