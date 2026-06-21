// Local storage service for video library
const STORAGE_KEY = 'video-library';

export const storage = {
    // Get all videos from library
    getVideos() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading from storage:', error);
            return [];
        }
    },

    // Save videos to library
    saveVideos(videos) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            return false;
        }
    },

    // Add a new video
    addVideo(video) {
        const videos = this.getVideos();
        const newVideo = {
            id: Date.now().toString(),
            addedDate: new Date().toISOString(),
            ...video
        };
        videos.unshift(newVideo); // Add to beginning
        this.saveVideos(videos);
        return newVideo;
    },

    // Remove a video by ID
    removeVideo(id) {
        const videos = this.getVideos();
        const filtered = videos.filter(v => v.id !== id);
        this.saveVideos(filtered);
        return true;
    },

    // Update a video
    updateVideo(id, updates) {
        const videos = this.getVideos();
        const index = videos.findIndex(v => v.id === id);
        if (index !== -1) {
            videos[index] = { ...videos[index], ...updates };
            this.saveVideos(videos);
            return videos[index];
        }
        return null;
    }
};

// Helper functions to extract video info from URLs
export const videoHelpers = {
    // Detect platform from URL - accepts ANY URL
    detectPlatform(url) {
        const urlLower = url.toLowerCase();

        // YouTube
        if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
            return 'Youtube';
        }
        // Twitch
        if (urlLower.includes('twitch.tv') || urlLower.includes('twitch.com')) {
            return 'Twitch';
        }
        // Kick
        if (urlLower.includes('kick.com')) {
            return 'Kick';
        }
        // Vimeo
        if (urlLower.includes('vimeo.com')) {
            return 'Vimeo';
        }
        // Dailymotion
        if (urlLower.includes('dailymotion.com')) {
            return 'Dailymotion';
        }
        // TikTok
        if (urlLower.includes('tiktok.com')) {
            return 'TikTok';
        }
        // Facebook
        if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) {
            return 'Facebook';
        }
        // Twitter/X
        if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
            return 'X/Twitter';
        }
        // Instagram
        if (urlLower.includes('instagram.com')) {
            return 'Instagram';
        }
        // Anime sites
        if (urlLower.includes('animeflv') || urlLower.includes('jkanime') ||
            urlLower.includes('monoschinos') || urlLower.includes('tioanime') ||
            urlLower.includes('animefenix') || urlLower.includes('crunchyroll')) {
            return 'Anime';
        }
        // Adult sites (for completeness - the app is for personal use)
        if (urlLower.includes('xvideos') || urlLower.includes('pornhub') ||
            urlLower.includes('xnxx') || urlLower.includes('xhamster') ||
            urlLower.includes('redtube')) {
            return 'Adulto';
        }
        // Direct video files
        if (urlLower.match(/\.(mp4|webm|ogg|m3u8|mkv|avi|mov)(\?|$)/i)) {
            return 'Video';
        }
        // Streaming/Player URLs
        if (urlLower.includes('/embed/') || urlLower.includes('player') ||
            urlLower.includes('iframe') || urlLower.includes('/e/')) {
            return 'Embed';
        }
        // Default: accept any URL as generic video/embed
        return 'Video';
    },

    // Extract YouTube video ID
    getYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    },

    // Extract Vimeo video ID
    getVimeoId(url) {
        const regExp = /vimeo.*\/(\d+)/i;
        const match = url.match(regExp);
        return match ? match[1] : null;
    },

    // Get YouTube thumbnail
    getYouTubeThumbnail(videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    },

    // Get embed URL for platform
    getEmbedUrl(url, platform) {
        const platformLower = platform.toLowerCase();

        switch (platformLower) {
            case 'youtube': {
                const id = this.getYouTubeId(url);
                return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url;
            }
            case 'vimeo': {
                const id = this.getVimeoId(url);
                return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : url;
            }
            case 'twitch': {
                // Handle Twitch clips and videos
                const clipMatch = url.match(/clips\.twitch\.tv\/([^/?]+)/);
                const videoMatch = url.match(/twitch\.tv\/videos\/(\d+)/);
                const channelMatch = url.match(/twitch\.tv\/([^/?]+)/);

                if (clipMatch) {
                    return `https://clips.twitch.tv/embed?clip=${clipMatch[1]}&parent=${window.location.hostname}`;
                } else if (videoMatch) {
                    return `https://player.twitch.tv/?video=${videoMatch[1]}&parent=${window.location.hostname}`;
                } else if (channelMatch && channelMatch[1] !== 'videos') {
                    return `https://player.twitch.tv/?channel=${channelMatch[1]}&parent=${window.location.hostname}`;
                }
                return url;
            }
            default:
                // Para cualquier otra URL, usarla directamente
                return url;
        }
    },

    // Generate thumbnail URL
    getThumbnail(url, platform) {
        const platformLower = platform.toLowerCase();

        switch (platformLower) {
            case 'youtube': {
                const id = this.getYouTubeId(url);
                return id ? this.getYouTubeThumbnail(id) : this.getPlaceholder('Youtube');
            }
            case 'vimeo':
                return this.getPlaceholder('Vimeo');
            case 'twitch':
                return this.getPlaceholder('Twitch', '#9146FF');
            case 'kick':
                return this.getPlaceholder('Kick', '#53FC18');
            case 'tiktok':
                return this.getPlaceholder('TikTok', '#FF0050');
            case 'facebook':
                return this.getPlaceholder('Facebook', '#1877F2');
            case 'x/twitter':
                return this.getPlaceholder('X', '#000000');
            case 'instagram':
                return this.getPlaceholder('Instagram', '#E4405F');
            case 'anime':
                return this.getPlaceholder('Anime', '#3b82f6');
            case 'adulto':
                return this.getPlaceholder('18+', '#ef4444');
            default:
                return this.getPlaceholder('Video', '#8b5cf6');
        }
    },

    // Generate SVG placeholder with platform name
    getPlaceholder(text, color = '#8b5cf6') {
        const encodedText = encodeURIComponent(text);
        return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect fill="%231a1a1a" width="400" height="225"/%3E%3Ctext fill="${color.replace('#', '%23')}" font-family="Arial" font-size="32" font-weight="bold" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E${encodedText}%3C/text%3E%3C/svg%3E`;
    }
};
