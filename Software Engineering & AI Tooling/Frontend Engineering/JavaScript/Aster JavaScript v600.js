function isDirectVideoUrl(value) {
  return /\.(?:mp4|webm|mov|m4v)(?:$|[?#])/i.test(String(value || ''));
}

export function normalizeMixedMedia({
  images = [],
  videos = [],
} = {}) {
  const normalizedImages = (Array.isArray(images) ? images : [])
    .map((item) => ({
      kind: 'image',
      pageUrl: item?.page_url || item?.url || item?.href || item?.src || '',
      mediaUrl: item?.src || item?.url || '',
      thumbnail: item?.thumbnail || item?.preview || item?.src || '',
      title: item?.title || item?.name || 'Image',
      source: item?.source || item?.platform || '',
    }))
    .filter((item) => item.thumbnail || item.mediaUrl);

  const normalizedVideos = (Array.isArray(videos) ? videos : [])
    .map((item) => {
      const mediaUrl = item?.src || item?.url || '';
      return {
        kind: 'video',
        pageUrl: item?.page_url || item?.watch_url || item?.href || mediaUrl,
        mediaUrl,
        thumbnail: item?.thumbnail || item?.preview || item?.image || '',
        title: item?.title || item?.name || 'Video',
        source: item?.source || item?.platform || '',
        channel: item?.channel || '',
        duration: item?.duration || '',
        directPlayable: isDirectVideoUrl(mediaUrl),
      };
    })
    .filter((item) => item.thumbnail || item.mediaUrl || item.pageUrl);

  return [...normalizedImages, ...normalizedVideos];
}
