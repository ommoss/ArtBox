import type { Payload } from 'payload'

import { resolvePresetName } from '@/lib/themes'

// Demo content for the artist template.
//
// All imageUrl values here point to web-resolution images (~1200px wide) — this
// mirrors how the real platform works: the artist's site only ever serves the
// smaller "preview" tier. Print-quality masters live on local storage at the
// shop in Victoria, BC and are pulled per-order, not exposed over the web.
//
// Content is theme-aware: the deployment's NEXT_PUBLIC_THEME selects a content
// set so each genre demo shows genre-appropriate work. Sailing (the default)
// has its own set; the other presets fall back to the neutral set until their
// own content is authored. This assumes each demo deployment has its own
// database — otherwise the sets would overwrite each other on boot.
//
// Re-running the seed force-updates existing rows so deployed demos pick up
// new URLs / new artworks on next boot.

type ArtworkSeed = {
  slug: string
  title: string
  galleryslug: string
  description: string
  year?: number
  location?: string
  imageUrl: string
  sortOrder?: number
  isFeatured?: boolean
  isLimitedEdition?: boolean
  editionSize?: number
  // Optional geo coordinates — used by the travel preset's per-gallery route
  // mini-map. Other presets leave these unset.
  lat?: number
  lng?: number
}

type GallerySeed = {
  slug: string
  name: string
  description: string
  coverImageUrl: string
  mapImageUrl?: string
  sortOrder: number
  // Optional geo coordinates — used by the travel preset's globe home to place
  // each gallery as a pin. Other presets leave these unset.
  lat?: number
  lng?: number
}

type ContentSet = {
  galleries: GallerySeed[]
  artworks: ArtworkSeed[]
}

// Unsplash query params we use everywhere:
//   w=1200  — artwork detail max usable width on desktop
//   w=900   — gallery cover cards (never displayed wider than ~600px)
//   q=75    — Unsplash's recommended quality for web preview
const COVER_PARAMS = 'auto=format&fit=crop&w=900&q=75'
const ART_PARAMS = 'auto=format&fit=crop&w=1200&q=75'

const u = (id: string, params: string) =>
  `https://images.unsplash.com/photo-${id}?${params}`

// ---------------------------------------------------------------------------
// Neutral set (default for all non-sailing presets until their own content is
// authored): coastal / studio / light / architecture.
// ---------------------------------------------------------------------------

const neutralGalleries: GallerySeed[] = [
  {
    slug: 'coastlines',
    name: 'Coastlines',
    description: 'Long-form work from the Pacific edge.',
    coverImageUrl: u('1507525428034-b723cf961d3e', COVER_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'studio',
    name: 'Studio',
    description: 'Still life and quieter work.',
    coverImageUrl: u('1506905925346-21bda4d32df4', COVER_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'light',
    name: 'Light',
    description: 'Studies in available and ambient light.',
    coverImageUrl: u('1481349518771-20055b2a7b24', COVER_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'architecture',
    name: 'Architecture',
    description: 'Found geometry in built environments.',
    coverImageUrl: u('1486325212027-8081e485255e', COVER_PARAMS),
    sortOrder: 4,
  },
]

const neutralArtworks: ArtworkSeed[] = [
  // Coastlines
  {
    slug: 'morning-fog',
    title: 'Morning fog',
    galleryslug: 'coastlines',
    description: 'Hand-printed from a 6×7 medium format negative.',
    year: 2024,
    location: 'Tofino, BC',
    imageUrl: u('1507525428034-b723cf961d3e', ART_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'low-tide',
    title: 'Low tide',
    galleryslug: 'coastlines',
    description: 'Late afternoon, west coast Vancouver Island.',
    year: 2024,
    location: 'Sombrio Beach, BC',
    imageUrl: u('1506953823976-52e1fdc0149a', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'driftwood-study',
    title: 'Driftwood study',
    galleryslug: 'coastlines',
    description: 'Detail of weathered cedar.',
    year: 2023,
    location: 'Long Beach, BC',
    imageUrl: u('1511497584788-876760111969', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'storm-front',
    title: 'Storm front',
    galleryslug: 'coastlines',
    description: 'Looking west from Cape Scott.',
    year: 2024,
    location: 'Cape Scott, BC',
    imageUrl: u('1500534314209-a25ddb2bd429', ART_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'kelp-line',
    title: 'Kelp line',
    galleryslug: 'coastlines',
    description: 'Bull kelp at low tide.',
    year: 2023,
    location: 'Botanical Beach, BC',
    imageUrl: u('1501949997128-2fdb9f6428f1', ART_PARAMS),
    sortOrder: 5,
  },

  // Studio
  {
    slug: 'still-life-with-lemons',
    title: 'Still life with lemons',
    galleryslug: 'studio',
    description: 'Available as a limited edition of 25.',
    year: 2025,
    location: 'Studio',
    imageUrl: u('1506905925346-21bda4d32df4', ART_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'ceramics-no-3',
    title: 'Ceramics No. 3',
    galleryslug: 'studio',
    description: 'Stoneware vessels, north window.',
    year: 2025,
    location: 'Studio',
    imageUrl: u('1493106819501-66d381c466f1', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'linen-and-stone',
    title: 'Linen and stone',
    galleryslug: 'studio',
    description: 'Composition study, afternoon.',
    year: 2024,
    location: 'Studio',
    imageUrl: u('1513519245088-0e12902e5a38', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'pears',
    title: 'Pears',
    galleryslug: 'studio',
    description: 'A single sitting, late October.',
    year: 2024,
    location: 'Studio',
    imageUrl: u('1568702846914-96b305d2aaeb', ART_PARAMS),
    sortOrder: 4,
  },

  // Light
  {
    slug: 'window-light',
    title: 'Window light',
    galleryslug: 'light',
    description: '',
    year: 2025,
    location: 'Studio',
    imageUrl: u('1481349518771-20055b2a7b24', ART_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'afternoon-corner',
    title: 'Afternoon corner',
    galleryslug: 'light',
    description: 'Hard shadows in a quiet hallway.',
    year: 2024,
    location: 'Victoria, BC',
    imageUrl: u('1499636136210-6f4ee915583e', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'curtain-study',
    title: 'Curtain study',
    galleryslug: 'light',
    description: 'Linen at 3:40 PM.',
    year: 2023,
    location: 'Studio',
    imageUrl: u('1505691938895-1758d7feb511', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'shadow-stair',
    title: 'Shadow stair',
    galleryslug: 'light',
    description: 'Cast geometry on a south wall.',
    year: 2024,
    location: 'Victoria, BC',
    imageUrl: u('1493134799591-2c9eed26201a', ART_PARAMS),
    sortOrder: 4,
  },

  // Architecture
  {
    slug: 'concrete-arch',
    title: 'Concrete arch',
    galleryslug: 'architecture',
    description: 'Brutalist civic structure, midday.',
    year: 2024,
    location: 'Vancouver, BC',
    imageUrl: u('1486325212027-8081e485255e', ART_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'roofline',
    title: 'Roofline',
    galleryslug: 'architecture',
    description: 'A pitched roof against thin cloud.',
    year: 2023,
    location: 'Salt Spring Island, BC',
    imageUrl: u('1487958449943-2429e8be8625', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'stairwell',
    title: 'Stairwell',
    galleryslug: 'architecture',
    description: 'Repeating treads, soft daylight.',
    year: 2024,
    location: 'Victoria, BC',
    imageUrl: u('1497366754035-f200968a6e72', ART_PARAMS),
    sortOrder: 3,
  },
]

// ---------------------------------------------------------------------------
// Sailing set (the default preset): marine / regatta / yacht work. Image IDs
// below were each fetched and visually confirmed to be sailing photographs.
// Organized mixed event + vessel-class + editorial, per the research. Six
// pieces are featured (they fill the home carousel); three are limited editions
// (they exercise the edition markers).
// ---------------------------------------------------------------------------

const sailingGalleries: GallerySeed[] = [
  {
    slug: 'regattas',
    name: 'Regattas',
    description: 'Race-day action from the great regatta circuits.',
    coverImageUrl: u('1603625354572-83f7a0c498a1', COVER_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'classics',
    name: 'Classic Yachts',
    description: 'Timber, bronze and canvas — the classic and J-Class fleet.',
    coverImageUrl: u('1573925805234-22b9e43a5450', COVER_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'offshore',
    name: 'Offshore',
    description: 'Open water, long passages and the quiet between marks.',
    coverImageUrl: u('1504813205186-380b1235a5d2', COVER_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'crew',
    name: 'Crew & Details',
    description: 'Life on deck — hands, lines and the working boat up close.',
    coverImageUrl: u('1605387202149-47169c4ea58a', COVER_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'editorial',
    name: 'Editorial',
    description: 'Selected commissions and tearsheets for the sailing press.',
    coverImageUrl: u('1528580279421-f0b84f9d7640', COVER_PARAMS),
    sortOrder: 5,
  },
]

const sailingArtworks: ArtworkSeed[] = [
  // Regattas
  {
    slug: 'golden-fleet',
    title: 'Golden Fleet',
    galleryslug: 'regattas',
    description: 'The fleet reaches home in the last light of the day.',
    year: 2023,
    location: 'Porto Cervo, Sardinia',
    imageUrl: u('1603625354572-83f7a0c498a1', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'planing',
    title: 'Planing',
    galleryslug: 'regattas',
    description: 'A dinghy lifts onto a plane in a hard puff.',
    year: 2024,
    location: 'Hyères, France',
    imageUrl: u('1506527240747-720a3e17b910', ART_PARAMS),
    sortOrder: 2,
    isFeatured: true,
  },
  {
    slug: 'three-abreast',
    title: 'Three Abreast',
    galleryslug: 'regattas',
    description: 'Three boats split tacks under a flat grey sky.',
    year: 2023,
    location: 'Newport, Rhode Island',
    imageUrl: u('1631995037903-c4f8064c48ae', ART_PARAMS),
    sortOrder: 3,
    isFeatured: true,
    isLimitedEdition: true,
    editionSize: 50,
  },
  {
    slug: 'the-long-beat',
    title: 'The Long Beat',
    galleryslug: 'regattas',
    description: 'Hard on the wind beneath a breaking sky.',
    year: 2022,
    location: 'Cowes, Isle of Wight',
    imageUrl: u('1602943554726-d8bebe914982', ART_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'at-the-mark',
    title: 'At the Mark',
    galleryslug: 'regattas',
    description: 'A single-hander leans into a turn at the buoy.',
    year: 2024,
    location: 'Kiel, Germany',
    imageUrl: u('1506527115643-b3b387978fad', ART_PARAMS),
    sortOrder: 5,
  },

  // Classic Yachts
  {
    slug: 'gaff-rigger',
    title: 'Gaff Rigger',
    galleryslug: 'classics',
    description: 'A classic heels to a Caribbean trade wind.',
    year: 2023,
    location: 'Antigua',
    imageUrl: u('1573925805234-22b9e43a5450', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
    isLimitedEdition: true,
    editionSize: 25,
  },
  {
    slug: 'three-on-the-bay',
    title: 'Three on the Bay',
    galleryslug: 'classics',
    description: 'Cruising yachts ghost along under a mountain shore.',
    year: 2022,
    location: 'Auckland, New Zealand',
    imageUrl: u('1501771924607-209f42a6e7e4', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'hard-over',
    title: 'Hard Over',
    galleryslug: 'classics',
    description: 'Rail down in open water.',
    year: 2023,
    location: 'Saint-Tropez, France',
    imageUrl: u('1484226162739-491af9b312b8', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'the-anchorage',
    title: 'The Anchorage',
    galleryslug: 'classics',
    description: 'The fleet at rest below the headland.',
    year: 2021,
    location: 'Portofino, Italy',
    imageUrl: u('1720247523030-3723ee3ccb45', ART_PARAMS),
    sortOrder: 4,
  },

  // Offshore
  {
    slug: 'sun-track',
    title: 'Sun Track',
    galleryslug: 'offshore',
    description: 'A lone boat crosses a band of afternoon light.',
    year: 2024,
    location: 'Hauraki Gulf, New Zealand',
    imageUrl: u('1504813205186-380b1235a5d2', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'spinnaker-backlit',
    title: 'Spinnaker, Backlit',
    galleryslug: 'offshore',
    description: 'The kite fills against a low sun.',
    year: 2023,
    location: 'Valencia, Spain',
    imageUrl: u('1594739201538-838ea94344df', ART_PARAMS),
    sortOrder: 2,
    isLimitedEdition: true,
    editionSize: 15,
  },
  {
    slug: 'glass',
    title: 'Glass',
    galleryslug: 'offshore',
    description: 'A ketch drifts on a windless evening.',
    year: 2022,
    location: 'Salish Sea, BC',
    imageUrl: u('1503634192480-e77a6436f075', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'headland-haze',
    title: 'Headland Haze',
    galleryslug: 'offshore',
    description: 'Smoke haze softens the far shore.',
    year: 2024,
    location: 'Salish Sea, BC',
    imageUrl: u('1630534416741-9f03d63dab22', ART_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'lone-sail',
    title: 'Lone Sail',
    galleryslug: 'offshore',
    description: 'One sail against a high white sky.',
    year: 2023,
    location: 'Strait of Georgia, BC',
    imageUrl: u('1519770340285-c801df5ff3db', ART_PARAMS),
    sortOrder: 5,
  },

  // Crew & Details
  {
    slug: 'last-light-on-deck',
    title: 'Last Light on Deck',
    galleryslug: 'crew',
    description: 'The watch settles in as the sun goes down.',
    year: 2023,
    location: 'Mid-Atlantic',
    imageUrl: u('1605387202149-47169c4ea58a', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'cockpit-dusk',
    title: 'Cockpit, Dusk',
    galleryslug: 'crew',
    description: 'Warm light along the coaming and winches.',
    year: 2022,
    location: 'Aegean Sea',
    imageUrl: u('1526761122248-c31c93f8b2b9', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'bow-watch',
    title: 'Bow Watch',
    galleryslug: 'crew',
    description: 'Looking forward from the foredeck under full sail.',
    year: 2023,
    location: 'Tyrrhenian Sea',
    imageUrl: u('1498623116890-37e912163d5d', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'two-up',
    title: 'Two Up',
    galleryslug: 'crew',
    description: 'A pair of dinghies run side by side.',
    year: 2024,
    location: 'English Channel',
    imageUrl: u('1613578699399-82ae71be53a3', ART_PARAMS),
    sortOrder: 4,
  },

  // Editorial
  {
    slug: 'dusk-fleet',
    title: 'Dusk Fleet',
    galleryslug: 'editorial',
    description: 'Commissioned for a regatta retrospective.',
    year: 2022,
    location: 'Lake Constance',
    imageUrl: u('1528580279421-f0b84f9d7640', ART_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'upwind',
    title: 'Upwind',
    galleryslug: 'editorial',
    description: 'Cover image, spring sailing annual.',
    year: 2023,
    location: 'Palma, Mallorca',
    imageUrl: u('1599922868403-9e022dfcfda0', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'scattered-fleet',
    title: 'Scattered Fleet',
    galleryslug: 'editorial',
    description: 'From a feature on coastal racing.',
    year: 2024,
    location: 'San Francisco Bay',
    imageUrl: u('1505781769017-55fdc40def2b', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'horizon-line',
    title: 'Horizon Line',
    galleryslug: 'editorial',
    description: 'Closing spread, offshore essay.',
    year: 2022,
    location: 'Strait of Juan de Fuca',
    imageUrl: u('1620149088397-8e168aab25c6', ART_PARAMS),
    sortOrder: 4,
  },
]

// ---------------------------------------------------------------------------
// Wildlife set: large-format limited-edition wildlife prints — African
// Savanna, Arctic & Boreal, Birds in Flight, Ocean Giants, Forest & Mountain.
// Every image ID was downloaded and visually confirmed to be a real photo of
// the animal it claims (captive / fenced / composite shots were dropped).
// Orientation is noted per image because the home carousel is full-bleed
// wide. Six pieces featured (all landscape), three limited editions.
// ---------------------------------------------------------------------------

const wildlifeGalleries: GallerySeed[] = [
  {
    slug: 'savanna',
    name: 'African Savanna',
    description: 'Big cats, elephants and the plains game of East and Southern Africa.',
    coverImageUrl: u('1759352370603-eeb21e082e74', COVER_PARAMS), // landscape 3:2
    sortOrder: 1,
  },
  {
    slug: 'arctic',
    name: 'Arctic & Boreal',
    description: 'Polar bears, foxes, wolves and penguins at the cold ends of the earth.',
    coverImageUrl: u('1553425300-8bd56360f8eb', COVER_PARAMS), // landscape 5:3
    sortOrder: 2,
  },
  {
    slug: 'birds',
    name: 'Birds in Flight',
    description: 'Raptors, owls and seabirds caught on the wing.',
    coverImageUrl: u('1696831387716-bf78923df0bf', COVER_PARAMS), // landscape 16:9
    sortOrder: 3,
  },
  {
    slug: 'ocean',
    name: 'Ocean Giants',
    description: 'Humpbacks and orcas from the Salish Sea to the Pacific.',
    coverImageUrl: u('1568430462989-44163eb1752f', COVER_PARAMS), // landscape 3:2
    sortOrder: 4,
  },
  {
    slug: 'forest',
    name: 'Forest & Mountain',
    description: 'Bears, moose and red deer of the northern woods.',
    coverImageUrl: u('1634193944924-18f637999e59', COVER_PARAMS), // landscape 3:2
    sortOrder: 5,
  },
]

const wildlifeArtworks: ArtworkSeed[] = [
  // African Savanna
  {
    slug: 'the-walk',
    title: 'The Walk',
    galleryslug: 'savanna',
    description: 'A big male crosses open grass on his morning patrol.',
    year: 2024,
    location: 'Maasai Mara, Kenya',
    imageUrl: u('1759352370603-eeb21e082e74', ART_PARAMS), // landscape 3:2
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'crossing-the-mara',
    title: 'Crossing the Mara',
    galleryslug: 'savanna',
    description: 'A family of elephants moves across the plain under a bank of haze.',
    year: 2023,
    location: 'Maasai Mara, Kenya',
    imageUrl: u('1481464904474-a575a33b44a0', ART_PARAMS), // landscape 3:2
    sortOrder: 2,
    isFeatured: true,
  },
  {
    slug: 'leopard-at-rest',
    title: 'Leopard at Rest',
    galleryslug: 'savanna',
    description: 'Draped over a marula branch in the last warm light.',
    year: 2024,
    location: 'Sabi Sand, South Africa',
    imageUrl: u('1758626736091-53981cc9a1d4', ART_PARAMS), // landscape 3:2
    sortOrder: 3,
    isLimitedEdition: true,
    editionSize: 50,
  },
  {
    slug: 'ngorongoro-light',
    title: 'Ngorongoro Light',
    galleryslug: 'savanna',
    description: 'Zebra graze the crater floor as sun breaks through the storm.',
    year: 2022,
    location: 'Ngorongoro Crater, Tanzania',
    imageUrl: u('1566296524462-e0a341bf65e6', ART_PARAMS), // landscape 3:2
    sortOrder: 4,
  },
  {
    slug: 'backlit',
    title: 'Backlit',
    galleryslug: 'savanna',
    description: 'A cheetah turns into the low sun on the Kalahari edge.',
    year: 2023,
    location: 'Kgalagadi, South Africa',
    imageUrl: u('1551969014-7d2c4cddf0b6', ART_PARAMS), // landscape 8:5
    sortOrder: 5,
  },
  {
    slug: 'etosha-dusk',
    title: 'Etosha Dusk',
    galleryslug: 'savanna',
    description: 'One giraffe against the orange sky after sundown.',
    year: 2022,
    location: 'Etosha, Namibia',
    imageUrl: u('1597419957697-30385606b5b4', ART_PARAMS), // landscape 16:9
    sortOrder: 6,
  },

  // Arctic & Boreal
  {
    slug: 'two-on-the-floe',
    title: 'Two on the Floe',
    galleryslug: 'arctic',
    description: 'A pair of young bears on pack ice north of Spitsbergen.',
    year: 2023,
    location: 'Svalbard, Norway',
    imageUrl: u('1553425300-8bd56360f8eb', ART_PARAMS), // landscape 5:3
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'swimmer',
    title: 'Swimmer',
    galleryslug: 'arctic',
    description: 'A polar bear crosses a fjord between floes.',
    year: 2023,
    location: 'Svalbard, Norway',
    imageUrl: u('1536164832230-6c238c58f740', ART_PARAMS), // landscape 3:2
    sortOrder: 2,
  },
  {
    slug: 'white-fox',
    title: 'White Fox',
    galleryslug: 'arctic',
    description: 'An arctic fox in winter coat sits out a squall.',
    year: 2024,
    location: 'Hornstrandir, Iceland',
    imageUrl: u('1484312152213-d713e8b7c053', ART_PARAMS), // landscape 3:2
    sortOrder: 3,
  },
  {
    slug: 'the-pack',
    title: 'The Pack',
    galleryslug: 'arctic',
    description: 'Grey wolves run a snowy slope through bare hardwoods.',
    year: 2022,
    location: 'Laurentians, Québec',
    imageUrl: u('1552249007-6759fe2742b6', ART_PARAMS), // landscape 10:7
    sortOrder: 4,
  },
  {
    slug: 'king-colony',
    title: 'King Colony',
    galleryslug: 'arctic',
    description: 'King penguins and their brown chicks below the glacier at Gold Harbour.',
    year: 2023,
    location: 'South Georgia',
    imageUrl: u('1551986782-9fa82053c9b9', ART_PARAMS), // landscape 3:2
    sortOrder: 5,
    isLimitedEdition: true,
    editionSize: 100,
  },

  // Birds in Flight
  {
    slug: 'bald-eagle',
    title: 'Bald Eagle',
    galleryslug: 'birds',
    description: 'Wings full spread against a flat winter sky.',
    year: 2024,
    location: 'Homer, Alaska',
    imageUrl: u('1696831387716-bf78923df0bf', ART_PARAMS), // landscape 16:9
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'the-strike',
    title: 'The Strike',
    galleryslug: 'birds',
    description: 'Talons down a moment before the eagle hits the water.',
    year: 2023,
    location: 'Mississippi River, Iowa',
    imageUrl: u('1643772352873-f9608f7370be', ART_PARAMS), // landscape 4:3
    sortOrder: 2,
  },
  {
    slug: 'hover',
    title: 'Hover',
    galleryslug: 'birds',
    description: 'A barn owl holds over rough grass, listening.',
    year: 2024,
    location: 'Norfolk, England',
    imageUrl: u('1710965084640-2e1a4bdfff9c', ART_PARAMS), // landscape 3:2
    sortOrder: 3,
  },
  {
    slug: 'snowy-owl-in-fog',
    title: 'Snowy Owl in Fog',
    galleryslug: 'birds',
    description: 'Banking through sea fog over the winter marsh.',
    year: 2023,
    location: 'Boundary Bay, BC',
    imageUrl: u('1636962027983-500f19243325', ART_PARAMS), // landscape 3:2
    sortOrder: 4,
    isLimitedEdition: true,
    editionSize: 75,
  },
  {
    slug: 'puffin-landing',
    title: 'Puffin, Landing',
    galleryslug: 'birds',
    description: 'Feet out and braking hard above the burrow.',
    year: 2024,
    location: 'Skomer Island, Wales',
    imageUrl: u('1717682273671-e611475e7101', ART_PARAMS), // near-square 5:4
    sortOrder: 5,
  },

  // Ocean Giants
  {
    slug: 'breach',
    title: 'Breach',
    galleryslug: 'ocean',
    description: 'A humpback clears the water on a flat calm afternoon.',
    year: 2023,
    location: 'Stellwagen Bank, Massachusetts',
    imageUrl: u('1568430462989-44163eb1752f', ART_PARAMS), // landscape 3:2
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'johnstone-strait',
    title: 'Johnstone Strait',
    galleryslug: 'ocean',
    description: 'An orca breaches off the forested shore at dawn.',
    year: 2024,
    location: 'Johnstone Strait, BC',
    imageUrl: u('1543431910-f9f3c6ad97c0', ART_PARAMS), // landscape 16:9
    sortOrder: 2,
    isFeatured: true,
  },
  {
    slug: 'fluke',
    title: 'Fluke',
    galleryslug: 'ocean',
    description: 'A humpback sounds beneath the West Maui mountains.',
    year: 2022,
    location: 'Maui, Hawaii',
    imageUrl: u('1450045439515-ff27c2f2e6b1', ART_PARAMS), // landscape 3:2
    sortOrder: 3,
  },
  {
    slug: 'pod',
    title: 'Pod',
    galleryslug: 'ocean',
    description: 'Four orcas surface together on grey water, seen from above.',
    year: 2023,
    location: 'Skjervøy, Norway',
    imageUrl: u('1598202604734-f6fcd12b2384', ART_PARAMS), // landscape 3:2
    sortOrder: 4,
  },
  {
    slug: 'salish-sea',
    title: 'Salish Sea',
    galleryslug: 'ocean',
    description: 'A lone bull crosses toward the Olympic shore.',
    year: 2024,
    location: 'Haro Strait, BC',
    imageUrl: u('1558900958-468345a79eaf', ART_PARAMS), // landscape 8:5
    sortOrder: 5,
  },

  // Forest & Mountain
  {
    slug: 'brooks-falls',
    title: 'Brooks Falls',
    galleryslug: 'forest',
    description: 'Three brown bears wait on the lip of the falls for the salmon run.',
    year: 2023,
    location: 'Katmai, Alaska',
    imageUrl: u('1634193944924-18f637999e59', ART_PARAMS), // landscape 3:2
    sortOrder: 1,
  },
  {
    slug: 'salmon-run',
    title: 'Salmon Run',
    galleryslug: 'forest',
    description: 'A grizzly works the shallows in September light.',
    year: 2024,
    location: 'Bute Inlet, BC',
    imageUrl: u('1696785561770-324a5bd4cc9a', ART_PARAMS), // landscape 5:3
    sortOrder: 2,
  },
  {
    slug: 'bull-moose',
    title: 'Bull Moose',
    galleryslug: 'forest',
    description: 'Bedded in autumn willow with a full rack.',
    year: 2023,
    location: 'Kananaskis, Alberta',
    imageUrl: u('1549471013-3364d7220b75', ART_PARAMS), // landscape 3:2
    sortOrder: 3,
  },
  {
    slug: 'first-snow',
    title: 'First Snow',
    galleryslug: 'forest',
    description: 'A red stag stands out the first fall of the winter.',
    year: 2022,
    location: 'Richmond Park, London',
    imageUrl: u('1543756605-a90da919605a', ART_PARAMS), // landscape 3:2
    sortOrder: 4,
  },
]

// ---------------------------------------------------------------------------
// Lifestyle set: editorial-lifestyle work — Stories, Portraits, Home &
// Interiors, Food & Table, Travel & Place. Image IDs were each fetched and
// visually confirmed to match their gallery (and to be on-brand — awkward or
// off-theme stock was dropped). Six pieces featured, three limited editions.
// ---------------------------------------------------------------------------

const lifestyleGalleries: GallerySeed[] = [
  {
    slug: 'stories',
    name: 'Stories',
    description: 'Candid features and the moments between the moments.',
    coverImageUrl: u('1742198836087-2bb54542dd99', COVER_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'portraits',
    name: 'Portraits',
    description: 'People in their own light, on their own ground.',
    coverImageUrl: u('1759968387919-03f97bf5fba9', COVER_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'home-interiors',
    name: 'Home & Interiors',
    description: 'Rooms, light and the quiet character of a space.',
    coverImageUrl: u('1649078299938-baaf739b617a', COVER_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'food-table',
    name: 'Food & Table',
    description: 'The table set, the meal shared, the light just so.',
    coverImageUrl: u('1586718520704-f7f9db04b8c0', COVER_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'travel-place',
    name: 'Travel & Place',
    description: 'Far places and the small figure in the wide frame.',
    coverImageUrl: u('1502003148287-a82ef80a6abc', COVER_PARAMS),
    sortOrder: 5,
  },
]

const lifestyleArtworks: ArtworkSeed[] = [
  // Stories
  {
    slug: 'through-the-mirror',
    title: 'Through the Mirror',
    galleryslug: 'stories',
    description: 'Caught in a café mirror — two friends mid-laugh.',
    year: 2024,
    location: 'Lisbon',
    imageUrl: u('1742198836087-2bb54542dd99', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'sunday-morning',
    title: 'Sunday Morning',
    galleryslug: 'stories',
    description: 'A slow start, feet up against the wall.',
    year: 2023,
    location: 'Copenhagen',
    imageUrl: u('1535268244390-8b989b92d2bc', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'after-dinner',
    title: 'After Dinner',
    galleryslug: 'stories',
    description: 'The conversation that runs past midnight.',
    year: 2024,
    location: 'Seoul',
    imageUrl: u('1765294661150-130e24807964', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'on-the-wall',
    title: 'On the Wall',
    galleryslug: 'stories',
    description: 'Two friends and a long view of the water.',
    year: 2023,
    location: 'Trieste',
    imageUrl: u('1750326460198-6a1bae6a0ed9', ART_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'coffee-saturday',
    title: 'Coffee, Saturday',
    galleryslug: 'stories',
    description: 'A quiet kitchen and nowhere to be.',
    year: 2024,
    location: 'At home',
    imageUrl: u('1758523417251-8af9cc60c8f4', ART_PARAMS),
    sortOrder: 5,
  },

  // Portraits
  {
    slug: 'goldenhour',
    title: 'Goldenhour',
    galleryslug: 'portraits',
    description: 'Last light through the leaves.',
    year: 2024,
    location: 'Lagos, Portugal',
    imageUrl: u('1759968387919-03f97bf5fba9', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
    isLimitedEdition: true,
    editionSize: 20,
  },
  {
    slug: 'off-the-boulevard',
    title: 'Off the Boulevard',
    galleryslug: 'portraits',
    description: 'Natural light, end of the day.',
    year: 2023,
    location: 'Marseille',
    imageUrl: u('1759476529769-71a5bc467bea', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'in-the-green',
    title: 'In the Green',
    galleryslug: 'portraits',
    description: 'An environmental portrait under the canopy.',
    year: 2024,
    location: 'Kerala, India',
    imageUrl: u('1762709267091-9cf812366888', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'lime',
    title: 'Lime',
    galleryslug: 'portraits',
    description: 'A study in colour and stillness.',
    year: 2023,
    location: 'Antananarivo',
    imageUrl: u('1765828593537-87f687cbeba1', ART_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'up-on-the-rail',
    title: 'Up on the Rail',
    galleryslug: 'portraits',
    description: 'A pause between errands.',
    year: 2024,
    location: 'Tehran',
    imageUrl: u('1770964211672-8d85fd3b033c', ART_PARAMS),
    sortOrder: 5,
  },

  // Home & Interiors
  {
    slug: 'the-reading-corner',
    title: 'The Reading Corner',
    galleryslug: 'home-interiors',
    description: 'A lamp, a green wall, a place to sit.',
    year: 2023,
    location: 'Portland, OR',
    imageUrl: u('1649078299938-baaf739b617a', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'three-oclock-light',
    title: "Three O'Clock Light",
    galleryslug: 'home-interiors',
    description: 'Afternoon sun across a bare table.',
    year: 2024,
    location: 'At home',
    imageUrl: u('1639690355531-88c0be941611', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'filament',
    title: 'Filament',
    galleryslug: 'home-interiors',
    description: 'Warm bulbs over an open room.',
    year: 2022,
    location: 'Brooklyn, NY',
    imageUrl: u('1504972090022-6edb81e4e534', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'warm-switch',
    title: 'Warm Switch',
    galleryslug: 'home-interiors',
    description: 'The last lamp on before bed.',
    year: 2023,
    location: 'At home',
    imageUrl: u('1624258391922-0b3056c471e7', ART_PARAMS),
    sortOrder: 4,
  },

  // Food & Table
  {
    slug: 'lemons-and-linen',
    title: 'Lemons & Linen',
    galleryslug: 'food-table',
    description: 'A table laid under dappled light.',
    year: 2024,
    location: 'Amalfi',
    imageUrl: u('1586718520704-f7f9db04b8c0', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'the-pass',
    title: 'The Pass',
    galleryslug: 'food-table',
    description: 'A plate set down between courses.',
    year: 2023,
    location: 'London',
    imageUrl: u('1414235077428-338989a2e8c0', ART_PARAMS),
    sortOrder: 2,
    isFeatured: true,
    isLimitedEdition: true,
    editionSize: 30,
  },
  {
    slug: 'sunday-brunch',
    title: 'Sunday Brunch',
    galleryslug: 'food-table',
    description: 'Hands and plates, late morning.',
    year: 2024,
    location: 'Melbourne',
    imageUrl: u('1424847651672-bf20a4b0982b', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'mise-en-place',
    title: 'Mise en Place',
    galleryslug: 'food-table',
    description: 'Setting the table before the guests arrive.',
    year: 2023,
    location: 'At home',
    imageUrl: u('1583254211338-57f4b21ed0f5', ART_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'long-table',
    title: 'Long Table',
    galleryslug: 'food-table',
    description: 'Candlelight down the length of the room.',
    year: 2022,
    location: 'Tuscany',
    imageUrl: u('1463183547458-6a2c760d0912', ART_PARAMS),
    sortOrder: 5,
  },

  // Travel & Place
  {
    slug: 'moraine',
    title: 'Moraine',
    galleryslug: 'travel-place',
    description: 'First light over the Valley of the Ten Peaks.',
    year: 2023,
    location: 'Banff, Alberta',
    imageUrl: u('1502003148287-a82ef80a6abc', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
    isLimitedEdition: true,
    editionSize: 25,
  },
  {
    slug: 'westbound',
    title: 'Westbound',
    galleryslug: 'travel-place',
    description: 'An old van on an empty desert road.',
    year: 2022,
    location: 'Arches, Utah',
    imageUrl: u('1469854523086-cc02fe5d8800', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'obersee',
    title: 'Obersee',
    galleryslug: 'travel-place',
    description: 'Stillness at the far end of the lake.',
    year: 2023,
    location: 'Berchtesgaden, Germany',
    imageUrl: u('1500259783852-0ca9ce8a64dc', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'headwind',
    title: 'Headwind',
    galleryslug: 'travel-place',
    description: 'Wind off the ridge, looking out.',
    year: 2024,
    location: 'North Cascades',
    imageUrl: u('1503457574462-bd27054394c1', ART_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'the-bend',
    title: 'The Bend',
    galleryslug: 'travel-place',
    description: 'The river turns under a burning sky.',
    year: 2022,
    location: 'Page, Arizona',
    imageUrl: u('1521579880562-101f47676ee1', ART_PARAMS),
    sortOrder: 5,
  },

  // --- Expansion (doubles each gallery so the magazine layout reads fuller) ---

  // Stories
  {
    slug: 'high-five',
    title: 'High Five',
    galleryslug: 'stories',
    description: 'A morning that got the better of everyone.',
    year: 2024,
    location: 'At home',
    imageUrl: u('1582298538104-fe2e74c27f59', ART_PARAMS),
    sortOrder: 6,
  },
  {
    slug: 'backlit-three',
    title: 'Backlit',
    galleryslug: 'stories',
    description: 'Three of them, end of the day.',
    year: 2023,
    location: 'Porto',
    imageUrl: u('1491438590914-bc09fcaaf77a', ART_PARAMS),
    sortOrder: 7,
  },
  {
    slug: 'the-pier',
    title: 'The Pier',
    galleryslug: 'stories',
    description: 'Walking it off, laughing.',
    year: 2024,
    location: 'Vancouver',
    imageUrl: u('1536010305525-f7aa0834e2c7', ART_PARAMS),
    sortOrder: 8,
  },
  {
    slug: 'cold-morning',
    title: 'Cold Morning',
    galleryslug: 'stories',
    description: 'Friends against the mist.',
    year: 2023,
    location: 'Banff',
    imageUrl: u('1504022462188-88f023db97bf', ART_PARAMS),
    sortOrder: 9,
  },
  {
    slug: 'on-the-sand',
    title: 'On the Sand',
    galleryslug: 'stories',
    description: 'Two friends, one long beach day.',
    year: 2024,
    location: 'Accra',
    imageUrl: u('1517840933437-c41356892b35', ART_PARAMS),
    sortOrder: 10,
  },

  // Portraits
  {
    slug: 'field-evening',
    title: 'Field, Evening',
    galleryslug: 'portraits',
    description: 'Stripes and the last of the sun.',
    year: 2024,
    location: 'Tuscany',
    imageUrl: u('1544005313-94ddf0286df2', ART_PARAMS),
    sortOrder: 6,
  },
  {
    slug: 'backlight',
    title: 'Backlight',
    galleryslug: 'portraits',
    description: 'Hair lit at dusk.',
    year: 2023,
    location: 'Lisbon',
    imageUrl: u('1526835746352-0b9da4054862', ART_PARAMS),
    sortOrder: 7,
  },
  {
    slug: 'shaft-of-light',
    title: 'Shaft of Light',
    galleryslug: 'portraits',
    description: 'A single window, a single beam.',
    year: 2024,
    location: 'Studio',
    imageUrl: u('1550783663-4c9ad5dee0eb', ART_PARAMS),
    sortOrder: 8,
    isLimitedEdition: true,
    editionSize: 15,
  },
  {
    slug: 'city-dusk',
    title: 'City Dusk',
    galleryslug: 'portraits',
    description: 'Looking past the lens.',
    year: 2023,
    location: 'Berlin',
    imageUrl: u('1576893972097-e51ec4368b54', ART_PARAMS),
    sortOrder: 9,
  },
  {
    slug: 'the-hat',
    title: 'The Hat',
    galleryslug: 'portraits',
    description: 'Sun straight through the brim.',
    year: 2024,
    location: 'Provence',
    imageUrl: u('1499111544217-9590382658d3', ART_PARAMS),
    sortOrder: 10,
  },

  // Home & Interiors
  {
    slug: 'herringbone',
    title: 'Herringbone',
    galleryslug: 'home-interiors',
    description: 'Morning across a bright room.',
    year: 2024,
    location: 'Copenhagen',
    imageUrl: u('1615529179035-e760f6a2dcee', ART_PARAMS),
    sortOrder: 5,
  },
  {
    slug: 'the-credenza',
    title: 'The Credenza',
    galleryslug: 'home-interiors',
    description: 'Wood, wool and a low sun.',
    year: 2023,
    location: 'At home',
    imageUrl: u('1600210491369-e753d80a41f3', ART_PARAMS),
    sortOrder: 6,
  },
  {
    slug: 'tall-windows',
    title: 'Tall Windows',
    galleryslug: 'home-interiors',
    description: 'Light all the way to the floor.',
    year: 2024,
    location: 'At home',
    imageUrl: u('1693382464372-fad822e7b38c', ART_PARAMS),
    sortOrder: 7,
  },
  {
    slug: 'grey-sofa',
    title: 'Grey Sofa',
    galleryslug: 'home-interiors',
    description: 'A quiet corner, nearly monochrome.',
    year: 2023,
    location: 'At home',
    imageUrl: u('1523755231516-e43fd2e8dca5', ART_PARAMS),
    sortOrder: 8,
  },
  {
    slug: 'the-green-couch',
    title: 'The Green Couch',
    galleryslug: 'home-interiors',
    description: 'A gallery wall and a houseplant.',
    year: 2024,
    location: 'At home',
    imageUrl: u('1632119580908-ae947d4c7691', ART_PARAMS),
    sortOrder: 9,
  },

  // Food & Table
  {
    slug: 'hydrangea',
    title: 'Hydrangea',
    galleryslug: 'food-table',
    description: 'Whites and greens down the table.',
    year: 2024,
    location: 'At home',
    imageUrl: u('1562050147-fda1cc9a6378', ART_PARAMS),
    sortOrder: 6,
  },
  {
    slug: 'tapers',
    title: 'Tapers',
    galleryslug: 'food-table',
    description: 'Candlelight on a long wooden table.',
    year: 2023,
    location: 'At home',
    imageUrl: u('1606660023296-81d67734170a', ART_PARAMS),
    sortOrder: 7,
  },
  {
    slug: 'garden-table',
    title: 'Garden Table',
    galleryslug: 'food-table',
    description: 'Peach and blue under the trees.',
    year: 2024,
    location: 'Provence',
    imageUrl: u('1595732301236-42a26208b2fc', ART_PARAMS),
    sortOrder: 8,
    isLimitedEdition: true,
    editionSize: 30,
  },
  {
    slug: 'bokeh',
    title: 'Bokeh',
    galleryslug: 'food-table',
    description: 'Wine glasses and a low flame.',
    year: 2023,
    location: 'At home',
    imageUrl: u('1639665905722-1627550c575a', ART_PARAMS),
    sortOrder: 9,
  },
  {
    slug: 'one-setting',
    title: 'One Setting',
    galleryslug: 'food-table',
    description: 'A single place laid by candlelight.',
    year: 2023,
    location: 'Tuscany',
    imageUrl: u('1625668931397-b9c35f63186b', ART_PARAMS),
    sortOrder: 10,
  },

  // Travel & Place
  {
    slug: 'le-campanella',
    title: 'Le Campanella',
    galleryslug: 'travel-place',
    description: 'A corner café fills up at dusk.',
    year: 2023,
    location: 'Paris',
    imageUrl: u('1662646133359-7cf4d2ab932e', ART_PARAMS),
    sortOrder: 6,
  },
  {
    slug: 'service',
    title: 'Service',
    galleryslug: 'travel-place',
    description: 'The waiter, mid-shift.',
    year: 2023,
    location: 'Paris',
    imageUrl: u('1672612077242-25a4359d2772', ART_PARAMS),
    sortOrder: 7,
  },
  {
    slug: 'roman-alley',
    title: 'Roman Alley',
    galleryslug: 'travel-place',
    description: 'Tables down a narrow lane.',
    year: 2022,
    location: 'Rome',
    imageUrl: u('1514897083766-6d22cf909486', ART_PARAMS),
    sortOrder: 8,
  },
  {
    slug: 'lit-terrace',
    title: 'Lit Terrace',
    galleryslug: 'travel-place',
    description: 'Bulbs on at the café.',
    year: 2023,
    location: 'Antwerp',
    imageUrl: u('1667038408799-4107ec35a1b5', ART_PARAMS),
    sortOrder: 9,
  },
  {
    slug: 'pink-facade',
    title: 'Pink Façade',
    galleryslug: 'travel-place',
    description: 'Umbrellas on a quiet street.',
    year: 2024,
    location: 'Lisbon',
    imageUrl: u('1509870449717-5609536a5393', ART_PARAMS),
    sortOrder: 10,
  },
]

// ---------------------------------------------------------------------------
// Fine-art set (abstract & minimal): four galleries — Form (light/shadow),
// Surface (water, pigment, texture), Aerial (abstract earth from above),
// Structure (architecture as abstract). Every image was fetched and visually
// confirmed to be a genuine photograph; CGI/3D renders and digital gradients
// were dropped (a planned "Colour" gallery was cut because Unsplash's results
// were all graphic gradients, not photography). Shown in the `solo` layout, so
// native aspect ratios matter — these are intentionally mixed. Six featured,
// three limited editions.
// ---------------------------------------------------------------------------

const artGalleries: GallerySeed[] = [
  {
    slug: 'form',
    name: 'Form',
    description: 'Light, shadow and the shape of an empty space.',
    coverImageUrl: u('1526567626283-bbfc1b49af19', COVER_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'surface',
    name: 'Surface',
    description: 'Water, pigment and texture, read up close.',
    coverImageUrl: u('1595944569184-ef0d8e315249', COVER_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'aerial',
    name: 'Aerial',
    description: 'The earth abstracted, straight down.',
    coverImageUrl: u('1751374041468-9ccb8e28202e', COVER_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'structure',
    name: 'Structure',
    description: 'Architecture reduced to line and plane.',
    coverImageUrl: u('1486718448742-163732cd1544', COVER_PARAMS),
    sortOrder: 4,
  },
]

const artArtworks: ArtworkSeed[] = [
  // Form
  {
    slug: 'crossing',
    title: 'Crossing',
    galleryslug: 'form',
    description: 'A lone figure crosses a field of cast shadows.',
    year: 2023,
    location: 'Tokyo',
    imageUrl: u('1526567626283-bbfc1b49af19', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
    isLimitedEdition: true,
    editionSize: 30,
  },
  {
    slug: 'aperture',
    title: 'Aperture',
    galleryslug: 'form',
    description: 'Window light resolves to a single bright mark.',
    year: 2022,
    imageUrl: u('1522123472015-2d9f7ee5608d', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'diagonal',
    title: 'Diagonal',
    galleryslug: 'form',
    description: 'Raking light divides a plaster wall.',
    year: 2023,
    imageUrl: u('1565419672978-6ba05e8859d5', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'stem',
    title: 'Stem',
    galleryslug: 'form',
    description: 'A single seed head held against the light.',
    year: 2024,
    imageUrl: u('1608195155945-6d1b97b0fe9c', ART_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'curtain-morning',
    title: 'Curtain, Morning',
    galleryslug: 'form',
    description: 'Sun through linen, early.',
    year: 2022,
    imageUrl: u('1529047033375-f402d3da24ca', ART_PARAMS),
    sortOrder: 5,
  },

  // Surface
  {
    slug: 'confluence',
    title: 'Confluence',
    galleryslug: 'surface',
    description: 'Pigment meets water and refuses to settle.',
    year: 2023,
    imageUrl: u('1595944569184-ef0d8e315249', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'reflection-no-4',
    title: 'Reflection No. 4',
    galleryslug: 'surface',
    description: 'Trees dissolve on a moving surface.',
    year: 2024,
    location: 'Oregon',
    imageUrl: u('1633791985199-172fd5c3e92d', ART_PARAMS),
    sortOrder: 2,
    isFeatured: true,
  },
  {
    slug: 'black-water',
    title: 'Black Water',
    galleryslug: 'surface',
    description: 'Last light on still water.',
    year: 2024,
    imageUrl: u('1762948050078-4f703c4c3352', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'shallows',
    title: 'Shallows',
    galleryslug: 'surface',
    description: 'Ripples read through clear water onto sand.',
    year: 2023,
    imageUrl: u('1776533640592-4158b95bc3cf', ART_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'fold',
    title: 'Fold',
    galleryslug: 'surface',
    description: 'Light folds across raw linen.',
    year: 2022,
    imageUrl: u('1576560020190-65297ecc392c', ART_PARAMS),
    sortOrder: 5,
  },

  // Aerial
  {
    slug: 'braid',
    title: 'Braid',
    galleryslug: 'aerial',
    description: 'A glacial river braids across black sand.',
    year: 2023,
    location: 'Iceland',
    imageUrl: u('1751374041468-9ccb8e28202e', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
    isLimitedEdition: true,
    editionSize: 25,
  },
  {
    slug: 'meltwater',
    title: 'Meltwater',
    galleryslug: 'aerial',
    description: 'Ice gives way to silt and blue.',
    year: 2022,
    location: 'Iceland',
    imageUrl: u('1660526224364-8f71a4a09514', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'canopy',
    title: 'Canopy',
    galleryslug: 'aerial',
    description: 'Autumn read straight down.',
    year: 2023,
    location: 'Vermont',
    imageUrl: u('1569531115477-5e9a74a6a8ca', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'bloom',
    title: 'Bloom',
    galleryslug: 'aerial',
    description: 'Sediment blooms into snowmelt.',
    year: 2024,
    imageUrl: u('1763995687854-580a8aad3c9f', ART_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'estuary',
    title: 'Estuary',
    galleryslug: 'aerial',
    description: 'Green water meets pale sand.',
    year: 2023,
    imageUrl: u('1617121062439-0a9a1f41f080', ART_PARAMS),
    sortOrder: 5,
  },
  {
    slug: 'interchange',
    title: 'Interchange',
    galleryslug: 'aerial',
    description: 'Symmetry built for boats and cars.',
    year: 2022,
    location: 'Netherlands',
    imageUrl: u('1712087473071-6b3debf9aa9a', ART_PARAMS),
    sortOrder: 6,
  },

  // Structure
  {
    slug: 'vermilion',
    title: 'Vermilion',
    galleryslug: 'structure',
    description: 'Ribbed terracotta turns against the sky.',
    year: 2023,
    location: 'Valencia',
    imageUrl: u('1486718448742-163732cd1544', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
    isLimitedEdition: true,
    editionSize: 20,
  },
  {
    slug: 'skin',
    title: 'Skin',
    galleryslug: 'structure',
    description: 'Steel skin catches the afternoon.',
    year: 2022,
    location: 'Los Angeles',
    imageUrl: u('1531591022136-eb8b0da1e6d0', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'louvre',
    title: 'Louvre',
    galleryslug: 'structure',
    description: 'Curved louvres comb the light.',
    year: 2023,
    imageUrl: u('1498262257252-c282316270bc', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'cantilever',
    title: 'Cantilever',
    galleryslug: 'structure',
    description: 'Concrete holds its breath.',
    year: 2024,
    imageUrl: u('1632667680404-572c57873c21', ART_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'courtyard',
    title: 'Courtyard',
    galleryslug: 'structure',
    description: 'Two trees, one long wall.',
    year: 2023,
    location: 'Portugal',
    imageUrl: u('1602128110234-2d11c0aaadfe', ART_PARAMS),
    sortOrder: 5,
  },
  {
    slug: 'edge',
    title: 'Edge',
    galleryslug: 'structure',
    description: 'A white edge against open sky.',
    year: 2022,
    imageUrl: u('1522404419647-18cb51cc5c7a', ART_PARAMS),
    sortOrder: 6,
    isFeatured: true,
  },
]

// ---------------------------------------------------------------------------
// Travel set: organized by trip/story — five named journeys, each a coherent
// place (mix of landscape, street and people). Every image was fetched and
// visually confirmed to read as its destination. Six featured, three editions.
// ---------------------------------------------------------------------------

const travelGalleries: GallerySeed[] = [
  {
    slug: 'hokkaido',
    name: 'Hokkaido in Winter',
    description: 'Two weeks in the deep snow of northern Japan.',
    coverImageUrl: u('1545014393-76c7b8936c76', COVER_PARAMS),
    sortOrder: 1,
    lat: 43.06,
    lng: 141.35,
  },
  {
    slug: 'morocco',
    name: 'The Atlas & the Medina',
    description: 'Marrakech, its souks, and the road to the mountains.',
    coverImageUrl: u('1697028703785-870aef3949b6', COVER_PARAMS),
    sortOrder: 2,
    lat: 31.63,
    lng: -7.99,
  },
  {
    slug: 'portugal',
    name: 'Coastal Portugal',
    description: 'Lisbon and the Atlantic edge, north to south.',
    coverImageUrl: u('1601399470081-29ab3942fd8b', COVER_PARAMS),
    sortOrder: 3,
    lat: 38.72,
    lng: -9.14,
  },
  {
    slug: 'patagonia',
    name: 'Patagonia End to End',
    description: 'A season among the towers of Torres del Paine.',
    coverImageUrl: u('1546569397-ab326af881f5', COVER_PARAMS),
    sortOrder: 4,
    lat: -50.94,
    lng: -72.95,
  },
  {
    slug: 'vietnam',
    name: 'Backroads of Vietnam',
    description: 'The terraced valleys of the far north.',
    coverImageUrl: u('1694152362587-99d77d21793b', COVER_PARAMS),
    sortOrder: 5,
    lat: 22.34,
    lng: 103.84,
  },
]

const travelArtworks: ArtworkSeed[] = [
  // Hokkaido in Winter
  {
    slug: 'otaru-canal-snowfall',
    title: 'Otaru Canal, Snowfall',
    galleryslug: 'hokkaido',
    description: 'Stone warehouses along the canal, mid-storm.',
    year: 2023,
    location: 'Otaru, Japan',
    imageUrl: u('1545014393-76c7b8936c76', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
    lat: 43.20,
    lng: 140.99,
  },
  {
    slug: 'mount-yotei',
    title: 'Mount Yotei',
    galleryslug: 'hokkaido',
    description: 'Ezo-Fuji wears its cloud.',
    year: 2023,
    location: 'Niseko, Japan',
    imageUrl: u('1686672712107-d2d4b269b124', ART_PARAMS),
    sortOrder: 2,
    isFeatured: true,
    isLimitedEdition: true,
    editionSize: 25,
    lat: 42.83,
    lng: 140.81,
  },
  {
    slug: 'niseko-main-street',
    title: 'Main Street',
    galleryslug: 'hokkaido',
    description: 'A quiet town under deep snow.',
    year: 2023,
    location: 'Niseko, Japan',
    imageUrl: u('1738394620508-55f7b4f79a09', ART_PARAMS),
    sortOrder: 3,
    lat: 42.80,
    lng: 140.69,
  },
  {
    slug: 'farm-tomita-in-white',
    title: 'Farm Tomita in White',
    galleryslug: 'hokkaido',
    description: 'A lone sign in a buried field.',
    year: 2023,
    location: 'Biei, Japan',
    imageUrl: u('1599220722244-2b48399b10da', ART_PARAMS),
    sortOrder: 4,
    lat: 43.42,
    lng: 142.47,
  },
  {
    slug: 'lake-mashu',
    title: 'Lake Mashu',
    galleryslug: 'hokkaido',
    description: 'One of the clearest lakes on earth, frozen at the rim.',
    year: 2023,
    location: 'Teshikaga, Japan',
    imageUrl: u('1680189109319-acacd21bfa10', ART_PARAMS),
    sortOrder: 5,
    lat: 43.58,
    lng: 144.53,
  },

  // The Atlas & the Medina
  {
    slug: 'ben-youssef',
    title: 'Ben Youssef',
    galleryslug: 'morocco',
    description: 'A visitor crosses the madrasa courtyard.',
    year: 2022,
    location: 'Marrakech, Morocco',
    imageUrl: u('1697028703785-870aef3949b6', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
    lat: 31.6315,
    lng: -7.9869,
  },
  {
    slug: 'the-rug-souk',
    title: 'The Rug Souk',
    galleryslug: 'morocco',
    description: 'Carpets hung three storeys deep.',
    year: 2022,
    location: 'Marrakech, Morocco',
    imageUrl: u('1653260137243-2b3daabf9aab', ART_PARAMS),
    sortOrder: 2,
    lat: 31.6258,
    lng: -7.9892,
  },
  {
    slug: 'red-door',
    title: 'Red Door',
    galleryslug: 'morocco',
    description: 'An ochre wall and a studded door.',
    year: 2022,
    location: 'Marrakech, Morocco',
    imageUrl: u('1672753566643-c67b5ac5359f', ART_PARAMS),
    sortOrder: 3,
    lat: 31.6240,
    lng: -7.9810,
  },
  {
    slug: 'koutoubia',
    title: 'Koutoubia',
    galleryslug: 'morocco',
    description: 'A calèche waits below the minaret.',
    year: 2022,
    location: 'Marrakech, Morocco',
    imageUrl: u('1611484158632-e7098dac0676', ART_PARAMS),
    sortOrder: 4,
    lat: 31.6238,
    lng: -7.9938,
  },
  {
    slug: 'the-spice-market',
    title: 'The Spice Market',
    galleryslug: 'morocco',
    description: 'Pyramids of cumin and rose.',
    year: 2022,
    location: 'Marrakech, Morocco',
    imageUrl: u('1570135460237-510ca82c6781', ART_PARAMS),
    sortOrder: 5,
    lat: 31.6270,
    lng: -7.9890,
  },

  // Coastal Portugal
  {
    slug: 'alfama-at-dusk',
    title: 'Alfama at Dusk',
    galleryslug: 'portugal',
    description: 'Tiled roofs run down to the Tagus.',
    year: 2024,
    location: 'Lisbon, Portugal',
    imageUrl: u('1601399470081-29ab3942fd8b', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
    lat: 38.7128,
    lng: -9.1286,
  },
  {
    slug: 'cabo-da-roca',
    title: 'Cabo da Roca',
    galleryslug: 'portugal',
    description: 'The westernmost edge of Europe.',
    year: 2024,
    location: 'Sintra, Portugal',
    imageUrl: u('1562760157-83585c4d01f8', ART_PARAMS),
    sortOrder: 2,
    isLimitedEdition: true,
    editionSize: 20,
    lat: 38.7805,
    lng: -9.4989,
  },
  {
    slug: 'the-blue-cove',
    title: 'The Blue Cove',
    galleryslug: 'portugal',
    description: 'Clear water below the Arrábida cliffs.',
    year: 2024,
    location: 'Setúbal, Portugal',
    imageUrl: u('1704556201224-b0aa56c7b7ac', ART_PARAMS),
    sortOrder: 3,
    lat: 38.4847,
    lng: -8.9786,
  },
  {
    slug: 'ponte-25-de-abril',
    title: '25 de Abril, Night',
    galleryslug: 'portugal',
    description: 'The bridge strung with light.',
    year: 2024,
    location: 'Lisbon, Portugal',
    imageUrl: u('1531259267539-a45cfb4fe070', ART_PARAMS),
    sortOrder: 4,
    lat: 38.6936,
    lng: -9.1772,
  },
  {
    slug: 'costa-da-caparica',
    title: 'Costa da Caparica',
    galleryslug: 'portugal',
    description: 'Late sun on a long Atlantic beach.',
    year: 2024,
    location: 'Almada, Portugal',
    imageUrl: u('1662670509703-2df59a820e85', ART_PARAMS),
    sortOrder: 5,
    lat: 38.6450,
    lng: -9.2336,
  },

  // Patagonia End to End
  {
    slug: 'base-of-the-towers',
    title: 'Base of the Towers',
    galleryslug: 'patagonia',
    description: 'Dawn light on the three granite towers.',
    year: 2023,
    location: 'Torres del Paine, Chile',
    imageUrl: u('1546569397-ab326af881f5', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
    isLimitedEdition: true,
    editionSize: 30,
    lat: -50.945,
    lng: -72.945,
  },
  {
    slug: 'cuernos-over-pehoe',
    title: 'Cuernos over Pehoé',
    galleryslug: 'patagonia',
    description: 'The horns above turquoise water.',
    year: 2023,
    location: 'Torres del Paine, Chile',
    imageUrl: u('1558517286-8a9cb0b8c793', ART_PARAMS),
    sortOrder: 2,
    lat: -51.060,
    lng: -73.000,
  },
  {
    slug: 'first-light-las-torres',
    title: 'First Light, Las Torres',
    galleryslug: 'patagonia',
    description: 'Alpenglow before the crowds.',
    year: 2023,
    location: 'Torres del Paine, Chile',
    imageUrl: u('1708394534994-4e66c2b09e1f', ART_PARAMS),
    sortOrder: 3,
    lat: -50.940,
    lng: -72.930,
  },
  {
    slug: 'the-overlook',
    title: 'The Overlook',
    galleryslug: 'patagonia',
    description: 'A long look across Lago Nordenskjöld.',
    year: 2023,
    location: 'Torres del Paine, Chile',
    imageUrl: u('1682024619121-aabb0305a496', ART_PARAMS),
    sortOrder: 4,
    lat: -50.980,
    lng: -72.920,
  },
  {
    slug: 'pehoe-in-a-gale',
    title: 'Pehoé in a Gale',
    galleryslug: 'patagonia',
    description: 'Wind tears the surface of the lake.',
    year: 2023,
    location: 'Torres del Paine, Chile',
    imageUrl: u('1637580981127-62d254c53a02', ART_PARAMS),
    sortOrder: 5,
    lat: -51.070,
    lng: -73.010,
  },

  // Backroads of Vietnam
  {
    slug: 'morning-over-the-terraces',
    title: 'Morning over the Terraces',
    galleryslug: 'vietnam',
    description: 'Sun burns through the valley mist.',
    year: 2022,
    location: 'Sapa, Vietnam',
    imageUrl: u('1694152362587-99d77d21793b', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
    lat: 22.340,
    lng: 103.844,
  },
  {
    slug: 'the-buffalo',
    title: 'The Buffalo',
    galleryslug: 'vietnam',
    description: 'A water buffalo works the high fields.',
    year: 2022,
    location: 'Sapa, Vietnam',
    imageUrl: u('1625989775494-c54cc0d80cd8', ART_PARAMS),
    sortOrder: 2,
    lat: 22.330,
    lng: 103.860,
  },
  {
    slug: 'one-house',
    title: 'One House',
    galleryslug: 'vietnam',
    description: 'A single home among the green steps.',
    year: 2022,
    location: 'Sapa, Vietnam',
    imageUrl: u('1666160416071-f760a7af9ea6', ART_PARAMS),
    sortOrder: 3,
    lat: 22.310,
    lng: 103.880,
  },
  {
    slug: 'muong-hoa-valley',
    title: 'Muong Hoa Valley',
    galleryslug: 'vietnam',
    description: 'Terraces all the way down.',
    year: 2022,
    location: 'Sapa, Vietnam',
    imageUrl: u('1731119347526-a51ad22763cd', ART_PARAMS),
    sortOrder: 4,
    lat: 22.300,
    lng: 103.900,
  },
  {
    slug: 'after-the-harvest',
    title: 'After the Harvest',
    galleryslug: 'vietnam',
    description: 'Gold and green on the cut terraces.',
    year: 2022,
    location: 'Mu Cang Chai, Vietnam',
    imageUrl: u('1732098407342-6b6a05e3da3d', ART_PARAMS),
    sortOrder: 5,
    lat: 21.840,
    lng: 104.110,
  },
]

const neutral: ContentSet = {
  galleries: neutralGalleries,
  artworks: neutralArtworks,
}
const sailing: ContentSet = {
  galleries: sailingGalleries,
  artworks: sailingArtworks,
}
const wildlife: ContentSet = {
  galleries: wildlifeGalleries,
  artworks: wildlifeArtworks,
}
const lifestyle: ContentSet = {
  galleries: lifestyleGalleries,
  artworks: lifestyleArtworks,
}
const art: ContentSet = {
  galleries: artGalleries,
  artworks: artArtworks,
}
const travel: ContentSet = {
  galleries: travelGalleries,
  artworks: travelArtworks,
}

// Pick the content set for this deployment's theme. Sailing is the default;
// presets without their own set yet fall back to the neutral content.
function contentSetForTheme(): ContentSet {
  const theme = resolvePresetName(process.env.NEXT_PUBLIC_THEME)
  if (theme === 'wildlife') return wildlife
  if (theme === 'lifestyle') return lifestyle
  if (theme === 'art') return art
  if (theme === 'travel') return travel
  return neutral
}

// Generate N synthetic "volume" artworks to stress-test pagination and admin
// performance. Gated on SEED_VOLUME_COUNT so it only runs when requested, and
// idempotent — skips if a sample already exists.
async function seedVolumeArtworks(
  payload: Payload,
  galleryIdBySlug: Map<string, number>,
  count: number,
  artworks: ArtworkSeed[],
) {
  if (count <= 0) return
  // Idempotency probe: if the last volume artwork is already there, skip.
  const last = (
    await payload.find({
      collection: 'artworks',
      where: { slug: { equals: `volume-${String(count).padStart(6, '0')}` } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]
  if (last) return

  const gallerySlugs = Array.from(galleryIdBySlug.keys())
  if (gallerySlugs.length === 0) return
  const imageIds = artworks.map((a) => a.imageUrl)

  // Find which slugs already exist so we can skip them in bulk. One query
  // beats N existence probes by a wide margin on Neon.
  const expectedSlugs = Array.from({ length: count }, (_, idx) =>
    `volume-${String(idx + 1).padStart(6, '0')}`,
  )
  const existing = await payload.find({
    collection: 'artworks',
    where: { slug: { in: expectedSlugs } },
    limit: count,
    depth: 0,
  })
  const existingSlugs = new Set(existing.docs.map((d) => d.slug as string))

  // Parallelize in chunks of 20 to balance throughput with Neon's connection
  // limits. ~10s for 1000 rows.
  const CHUNK = 20
  for (let chunkStart = 1; chunkStart <= count; chunkStart += CHUNK) {
    const chunkEnd = Math.min(chunkStart + CHUNK - 1, count)
    await Promise.all(
      Array.from({ length: chunkEnd - chunkStart + 1 }, (_, k) => {
        const i = chunkStart + k
        const slug = `volume-${String(i).padStart(6, '0')}`
        if (existingSlugs.has(slug)) return Promise.resolve()
        const gSlug = gallerySlugs[i % gallerySlugs.length]
        const galleryId = galleryIdBySlug.get(gSlug)
        if (!galleryId) return Promise.resolve()
        return payload.create({
          collection: 'artworks',
          data: {
            slug,
            title: `Study ${String(i).padStart(4, '0')}`,
            gallery: galleryId,
            description: '',
            imageUrl: imageIds[i % imageIds.length],
            sortOrder: 1000 + i,
            isPublished: true,
          },
        })
      }),
    )
  }
}

export async function seedDemoContent(payload: Payload) {
  const { galleries, artworks } = contentSetForTheme()

  // Safety: if the database already holds galleries and NONE of them belong to
  // this theme's content set, it's another preset's database — bail out rather
  // than pollute it. This is what stops `NEXT_PUBLIC_THEME=travel pnpm dev`
  // (run without overriding DATABASE_URI) from seeding travel galleries into
  // the sailing DB. Re-seeding the same theme, or seeding an empty DB, proceeds.
  const mySlugs = new Set(galleries.map((g) => g.slug))
  const existing = await payload.find({ collection: 'galleries', limit: 100, depth: 0 })
  if (
    existing.docs.length > 0 &&
    !existing.docs.some((g) => mySlugs.has(g.slug as string))
  ) {
    console.warn(
      `[seed] Skipped: the database already contains galleries from a different preset ` +
        `(${existing.docs.map((g) => g.slug).join(', ')}), not the ` +
        `'${resolvePresetName(process.env.NEXT_PUBLIC_THEME)}' set. ` +
        `Point DATABASE_URI at the right branch or clear it before seeding.`,
    )
    return
  }

  const galleryIdBySlug = new Map<string, number>()

  for (const g of galleries) {
    const existing = (
      await payload.find({
        collection: 'galleries',
        where: { slug: { equals: g.slug } },
        limit: 1,
        depth: 0,
      })
    ).docs[0]
    if (existing) {
      galleryIdBySlug.set(g.slug, Number(existing.id))
      await payload.update({
        collection: 'galleries',
        id: existing.id,
        data: {
          name: g.name,
          description: g.description,
          coverImageUrl: g.coverImageUrl,
          mapImageUrl: g.mapImageUrl,
          sortOrder: g.sortOrder,
          isPublished: true,
          lat: g.lat,
          lng: g.lng,
        },
      })
      continue
    }
    const created = await payload.create({
      collection: 'galleries',
      data: {
        slug: g.slug,
        name: g.name,
        description: g.description,
        coverImageUrl: g.coverImageUrl,
        mapImageUrl: g.mapImageUrl,
        sortOrder: g.sortOrder,
        isPublished: true,
        lat: g.lat,
        lng: g.lng,
      },
    })
    galleryIdBySlug.set(g.slug, Number(created.id))
  }

  for (const a of artworks) {
    const galleryId = galleryIdBySlug.get(a.galleryslug)
    if (!galleryId) continue
    const existing = (
      await payload.find({
        collection: 'artworks',
        where: { slug: { equals: a.slug } },
        limit: 1,
        depth: 0,
      })
    ).docs[0]
    // Edition fields: editionsRemaining is auto-initialized from editionSize by
    // the Artworks beforeChange hook, so we only set the inputs here.
    const editionData = {
      isFeatured: a.isFeatured ?? false,
      isLimitedEdition: a.isLimitedEdition ?? false,
      editionSize: a.editionSize,
      lat: a.lat,
      lng: a.lng,
    }
    if (existing) {
      await payload.update({
        collection: 'artworks',
        id: existing.id,
        data: {
          title: a.title,
          gallery: galleryId,
          description: a.description,
          year: a.year,
          location: a.location,
          imageUrl: a.imageUrl,
          sortOrder: a.sortOrder ?? 0,
          isPublished: true,
          ...editionData,
        },
      })
      continue
    }
    await payload.create({
      collection: 'artworks',
      data: {
        slug: a.slug,
        title: a.title,
        gallery: galleryId,
        description: a.description,
        year: a.year,
        location: a.location,
        imageUrl: a.imageUrl,
        sortOrder: a.sortOrder ?? 0,
        isPublished: true,
        ...editionData,
      },
    })
  }

  const volumeCount = parseInt(process.env.SEED_VOLUME_COUNT ?? '0', 10)
  if (volumeCount > 0) {
    await seedVolumeArtworks(payload, galleryIdBySlug, volumeCount, artworks)
  }
}
