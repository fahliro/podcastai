export interface OrbTheme {
  id: string;
  name: string;
  description: string;
  colors: string[];
  coreColor: string;
  glowColor: string;
  particleColor: string;
}

export const ORB_THEMES: OrbTheme[] = [
  {
    id: 'siri-classic',
    name: 'Siri iOS 18 (Original)',
    description: 'Gradien multi-layer khas Siri Apple dengan pendaran cyan, magenta, dan violet.',
    colors: ['#00F0FF', '#FF00A0', '#7000FF', '#0055FF', '#FF8A00'],
    coreColor: '#FFFFFF',
    glowColor: 'rgba(0, 240, 255, 0.4)',
    particleColor: '#FFFFFF'
  },
  {
    id: 'neon-cyberpunk',
    name: 'Neon Cyberpunk',
    description: 'Kontras tinggi hijau neon, pink elektrik, dan ungu futuristic.',
    colors: ['#00FF66', '#FF007F', '#8A00FF', '#00E5FF'],
    coreColor: '#FFFFFF',
    glowColor: 'rgba(255, 0, 127, 0.5)',
    particleColor: '#00FF66'
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Gold',
    description: 'Pendaran hangat emas, oranye jingga, dan merah crimson.',
    colors: ['#FF3300', '#FF8800', '#FFCC00', '#FF0055'],
    coreColor: '#FFF5E0',
    glowColor: 'rgba(255, 136, 0, 0.5)',
    particleColor: '#FFE082'
  },
  {
    id: 'aurora-sky',
    name: 'Aurora Borealis',
    description: 'Nuansa magis hijau zamrud, cyan samudra, dan violet malam.',
    colors: ['#00FFBB', '#0099FF', '#7000FF', '#00FF66'],
    coreColor: '#E0FFFF',
    glowColor: 'rgba(0, 255, 187, 0.45)',
    particleColor: '#B2FFE5'
  },
  {
    id: 'deep-cosmos',
    name: 'Deep Cosmos',
    description: 'Nuansa luar angkasa biru indigo, magenta nebula, dan putih bintang.',
    colors: ['#3A0080', '#001A99', '#9900CC', '#00BFFF'],
    coreColor: '#F0F5FF',
    glowColor: 'rgba(153, 0, 204, 0.4)',
    particleColor: '#E0E8FF'
  },
  {
    id: 'electric-ultra',
    name: 'Electric Pulse',
    description: 'Energi tinggi cyan terang dan violet ultraviolet.',
    colors: ['#00E5FF', '#7A00FF', '#0051FF', '#FF00D6'],
    coreColor: '#FFFFFF',
    glowColor: 'rgba(0, 229, 255, 0.5)',
    particleColor: '#B3F5FF'
  },
  {
    id: 'silver-monochrome',
    name: 'Platinum Silver',
    description: 'Tampilan minimalis elegan monokromatik dengan kilau berlian.',
    colors: ['#FFFFFF', '#C0C0C0', '#808080', '#E5E5E5'],
    coreColor: '#FFFFFF',
    glowColor: 'rgba(255, 255, 255, 0.4)',
    particleColor: '#FFFFFF'
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    description: 'Kombinasi hijau zamrud neon, mint berkilau, dan teal cyans tajam.',
    colors: ['#00FF88', '#00E5A3', '#00B37E', '#00FFAA', '#028A58'],
    coreColor: '#E6FFFA',
    glowColor: 'rgba(0, 255, 136, 0.5)',
    particleColor: '#A3FFD6'
  },
  {
    id: 'lava-magma',
    name: 'Lava Magma',
    description: 'Energi membara merah magma, oranye gumpalan lava, dan kuning api.',
    colors: ['#FF1A00', '#FF5500', '#FF9900', '#CC0033'],
    coreColor: '#FFF2E6',
    glowColor: 'rgba(255, 85, 0, 0.55)',
    particleColor: '#FFD1B3'
  },
  {
    id: 'amethyst-crystal',
    name: 'Amethyst Crystal',
    description: 'Kemewahan batu kristal kecubung, violet kerajaan, dan fuchsia berkilau.',
    colors: ['#A100FF', '#7000FF', '#D400FF', '#4B0082'],
    coreColor: '#F5E6FF',
    glowColor: 'rgba(161, 0, 255, 0.5)',
    particleColor: '#EBB3FF'
  },
  {
    id: 'ocean-abyss',
    name: 'Ocean Abyss',
    description: 'Kedalaman laut samudra biru cobalt, turquoise, dan aqua cyan.',
    colors: ['#0077FF', '#00D4FF', '#003399', '#00FFA6'],
    coreColor: '#E6F9FF',
    glowColor: 'rgba(0, 212, 255, 0.45)',
    particleColor: '#B3F2FF'
  },
  {
    id: 'cherry-blossom',
    name: 'Sakura Blossom',
    description: 'Estetika bunga sakura Jepang pink lembut, rose gold, dan coral hangat.',
    colors: ['#FF66B2', '#FF99CC', '#FF3385', '#FFCCE5'],
    coreColor: '#FFF0F5',
    glowColor: 'rgba(255, 102, 178, 0.45)',
    particleColor: '#FFE6F2'
  },
  {
    id: 'supernova',
    name: 'Solar Supernova',
    description: 'Ledakan bintang emas bersinar, plasma oranye, dan putih tajam.',
    colors: ['#FFD700', '#FFAA00', '#FF4500', '#FFF8DC'],
    coreColor: '#FFFFFF',
    glowColor: 'rgba(255, 215, 0, 0.55)',
    particleColor: '#FFF5B8'
  },
  {
    id: 'hyper-pop',
    name: 'Hyper Pop Candy',
    description: 'Kombinasi pop ceria pink permen, cyan terang, dan kuning neon.',
    colors: ['#FF0099', '#00EEFF', '#FFE600', '#00FF66'],
    coreColor: '#FFFFFF',
    glowColor: 'rgba(255, 0, 153, 0.5)',
    particleColor: '#FFB3E6'
  },
  {
    id: 'holographic',
    name: 'Holographic Prism',
    description: 'Spektrum pelangi iridescent futuristik dengan kilasan hologram pastel.',
    colors: ['#FF9EE2', '#9EFAFF', '#FFF69E', '#C29EFF'],
    coreColor: '#FFFFFF',
    glowColor: 'rgba(158, 250, 255, 0.5)',
    particleColor: '#FFFFFF'
  },
  {
    id: 'midnight-tokyo',
    name: 'Tokyo Midnight',
    description: 'Atmosfer gemerlap kota Tokyo malam hari dengan neon magenta & indigo.',
    colors: ['#FF0055', '#2B00FF', '#9900FF', '#00F0FF'],
    coreColor: '#F5F0FF',
    glowColor: 'rgba(255, 0, 85, 0.5)',
    particleColor: '#E0B3FF'
  },
  {
    id: 'toxic-venom',
    name: 'Toxic Venom',
    description: 'Nuansa radioaktif hijau racun menyala, kuning asam, dan teal gelap.',
    colors: ['#39FF14', '#CCFF00', '#00FF99', '#0A5C36'],
    coreColor: '#F0FFF0',
    glowColor: 'rgba(57, 255, 20, 0.55)',
    particleColor: '#D1FFB3'
  },
  {
    id: 'inferno-violet',
    name: 'Violet Inferno',
    description: 'Api ungu membara fuchsia menyala, merah ruby, dan oranye api.',
    colors: ['#E60073', '#8000FF', '#FF0040', '#FF6600'],
    coreColor: '#FFF0F5',
    glowColor: 'rgba(230, 0, 115, 0.5)',
    particleColor: '#FFB3D9'
  }
];

export interface PresetPosterBg {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
}

export const PRESET_POSTER_BGS: PresetPosterBg[] = [
  {
    id: 'studio-neon',
    name: 'Cyber Studio',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1080&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'dark-poster',
    name: 'Aesthetic Dark',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'gradient-wave',
    name: 'Gradient Poster',
    url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=1080&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'minimal-podium',
    name: 'Podium Minimal',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1080&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=200&q=80'
  }
];

export interface OrbSettings {
  themeId: string;
  size: number;           // 100 to 400px base radius
  sensitivity: number;    // 0.5 to 2.5 audio sensitivity
  rotationSpeed: number;  // 0.2 to 3.0
  waveComplexity: number; // 2 to 10 noise octaves/harmonics
  waveDeform: number;     // 20 to 120 amplitude
  glowIntensity: number;  // 0.2 to 1.0
  orbOpacity: number;     // 0.2 to 1.0 transparency of the orb liquid layers
  blendMode: 'lighter' | 'normal' | 'screen'; // color blending mode for liquid layers
  particleCount: number;  // 0 to 80 sparkles
  showCoreGlow: boolean;  // enable inner core light
  coreOpacity: number;   // 0.1 to 1.0 core light transparency/glow opacity
  wireframeMode: boolean; // toggle geometric wireframe look
  bgStyle: 'dark' | 'black' | 'midnight' | 'gradient' | 'image' | 'checkerboard'; // solid / poster backdrop
  bgImage: string | null;  // custom image URL or data URL
  bgImageDim: number;      // 0 to 90% background image darkening/dim level
  aspectRatio: '9:16' | '1:1' | '16:9' | 'free'; // preview canvas aspect ratio
  orbOffset: { x: number; y: number }; // floating offset from center
}

export const DEFAULT_ORB_SETTINGS: OrbSettings = {
  themeId: 'deep-cosmos', // Set Deep Cosmos as default for ultra-vivid clear colors
  size: 220,
  sensitivity: 1.2,
  rotationSpeed: 1.0,
  waveComplexity: 5,
  waveDeform: 50,
  glowIntensity: 0.8,
  orbOpacity: 1.0,
  blendMode: 'lighter',
  particleCount: 35,
  showCoreGlow: true,
  coreOpacity: 0.6,
  wireframeMode: false,
  bgStyle: 'dark', // Default to solid deep slate background for clean non-transparent video & preview
  bgImage: null,
  bgImageDim: 40,
  aspectRatio: '9:16', // Default to TikTok / Reels (9:16) format
  orbOffset: { x: 0, y: 0 }
};
