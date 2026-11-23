type YouTubeEmbedProps = {
    videoId: string;
    title?: string;
};

export function YouTubeEmbed({ videoId, title = 'YouTube video' }: YouTubeEmbedProps) {
    return (
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-lms-line bg-black">
            <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="size-full"
            />
        </div>
    );
}
