import type { ArtworkSeed, GallerySeed } from '../demo-content'

// Wabi-sabi set: quiet still life and nature in muted earth tones. Clay,
// Moss & Stone, Dried & Fallen, Mist. Every image ID was downloaded and
// visually checked (real photographs, soft light, low saturation, no text or
// faces). Orientation noted per image. Six featured, three limited editions.

const COVER = 'auto=format&fit=crop&w=900&q=75'
const ART = 'auto=format&fit=crop&w=1200&q=75'
const u = (id: string, params: string) => `https://images.unsplash.com/photo-${id}?${params}`

export const wabisabiGalleries: GallerySeed[] = [
  {
    slug: 'clay',
    name: 'Clay',
    description: 'Tea bowls and vessels, thrown by hand and marked by use.',
    coverImageUrl: u('1597696929736-6d13bed8e6a8', COVER), // landscape 3:2
    sortOrder: 1,
  },
  {
    slug: 'moss-stone',
    name: 'Moss & Stone',
    description: 'Slow growth on old rock, and the gardens built around it.',
    coverImageUrl: u('1762876244984-f9d493cf4aa1', COVER), // landscape 3:2
    sortOrder: 2,
  },
  {
    slug: 'dried-fallen',
    name: 'Dried & Fallen',
    description: 'Grasses, petals and leaves after their season has passed.',
    coverImageUrl: u('1642347673791-a910bff6ee78', COVER), // portrait 4:5
    sortOrder: 3,
  },
  {
    slug: 'mist',
    name: 'Mist',
    description: 'Fog, rain and the temple paths that disappear into them.',
    coverImageUrl: u('1726480244470-62c21ad2fc17', COVER), // landscape 3:2
    sortOrder: 4,
  },
]

export const wabisabiArtworks: ArtworkSeed[] = [
  // Clay
  {
    slug: 'ws-blue-tea-bowl',
    title: 'Blue Tea Bowl',
    galleryslug: 'clay',
    description: 'A pale glazed bowl of cooling tea on an undyed linen cloth.',
    year: 2024,
    location: 'Mashiko, Japan',
    imageUrl: u('1768677675311-ad831e8d4be0', ART), // portrait 3:4
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'ws-white-in-shadow',
    title: 'White in Shadow',
    galleryslug: 'clay',
    description: 'A porcelain tea set gathered in the dark, lit from one side.',
    year: 2023,
    location: 'Arita, Japan',
    imageUrl: u('1763824371971-cf1b3a1f859c', ART), // landscape 3:2
    sortOrder: 2,
  },
  {
    slug: 'ws-tenmoku',
    title: 'Tenmoku',
    galleryslug: 'clay',
    description: 'A single black-glazed bowl in a pool of grey light.',
    year: 2022,
    location: 'Kyoto, Japan',
    imageUrl: u('1622947344865-a7fcf40e88e7', ART), // portrait 5:7
    sortOrder: 3,
    isLimitedEdition: true,
    editionSize: 25,
  },
  {
    slug: 'ws-three-bowls',
    title: 'Three Bowls',
    galleryslug: 'clay',
    description: 'Celadon cups from above, each glaze pooling a little differently.',
    year: 2021,
    location: 'Seto, Japan',
    imageUrl: u('1587560555570-4d3f84dcee05', ART), // portrait 2:3
    sortOrder: 4,
  },
  {
    slug: 'ws-shelf-of-vessels',
    title: 'Shelf of Vessels',
    galleryslug: 'clay',
    description: 'Odd vases in cream and ash, crazed and chipped, lined up against a white wall.',
    year: 2020,
    location: 'Copenhagen, Denmark',
    imageUrl: u('1597696929736-6d13bed8e6a8', ART), // landscape 3:2
    sortOrder: 5,
  },
  {
    slug: 'ws-unglazed',
    title: 'Unglazed',
    galleryslug: 'clay',
    description: 'Small bisque bottles still the colour of the earth they came from.',
    year: 2019,
    location: 'Bizen, Japan',
    imageUrl: u('1520408222757-6f9f95d87d5d', ART), // landscape 7:6
    sortOrder: 6,
  },

  // Moss & Stone
  {
    slug: 'ws-fern-in-the-crack',
    title: 'Fern in the Crack',
    galleryslug: 'moss-stone',
    description: 'A small fern taking hold in a split of dark wet rock.',
    year: 2023,
    location: 'Hoh Rainforest, USA',
    imageUrl: u('1670737629820-57a9f0cfafcb', ART), // landscape 3:2
    sortOrder: 1,
  },
  {
    slug: 'ws-lichen-and-moss',
    title: 'Lichen and Moss',
    galleryslug: 'moss-stone',
    description: 'Moss and pale lichen spreading over a weathered boulder.',
    year: 2022,
    location: 'Yakushima, Japan',
    imageUrl: u('1607258731619-9b5d08946c7c', ART), // landscape 3:2
    sortOrder: 2,
  },
  {
    slug: 'ws-old-wall',
    title: 'Old Wall',
    galleryslug: 'moss-stone',
    description: 'A dry stone wall slowly giving itself back to the moss.',
    year: 2021,
    location: 'Hardanger, Norway',
    imageUrl: u('1699005706813-01594780b928', ART), // portrait 5:7
    sortOrder: 3,
  },
  {
    slug: 'ws-ryoanji',
    title: 'Ryoan-ji',
    galleryslug: 'moss-stone',
    description: 'Stone and moss islands on raked gravel before the old clay wall.',
    year: 2024,
    location: 'Kyoto, Japan',
    imageUrl: u('1762876244984-f9d493cf4aa1', ART), // landscape 3:2
    sortOrder: 4,
    isFeatured: true,
  },
  {
    slug: 'ws-raked-circle',
    title: 'Raked Circle',
    galleryslug: 'moss-stone',
    description: 'Rings of raked gravel turning around a single standing stone.',
    year: 2023,
    location: 'Kamakura, Japan',
    imageUrl: u('1674893168376-c3d8efc23906', ART), // landscape 8:7
    sortOrder: 5,
    isFeatured: true,
  },

  // Dried & Fallen
  {
    slug: 'ws-dry-lily',
    title: 'Dry Lily',
    galleryslug: 'dried-fallen',
    description: 'A lily left to dry, its petals curling back on white paper.',
    year: 2022,
    location: 'Tokyo, Japan',
    imageUrl: u('1581524674552-80462a204517', ART), // portrait 2:3
    sortOrder: 1,
  },
  {
    slug: 'ws-baby-breath',
    title: "Baby's Breath",
    galleryslug: 'dried-fallen',
    description: 'A dried bouquet leaning into the frame against a bare plaster wall.',
    year: 2021,
    location: 'Stockholm, Sweden',
    imageUrl: u('1619422305894-dd096b3e6b98', ART), // portrait 2:3
    sortOrder: 2,
  },
  {
    slug: 'ws-reeds',
    title: 'Reeds',
    galleryslug: 'dried-fallen',
    description: 'Winter reeds bending under a flat white sky.',
    year: 2024,
    location: 'Hokkaido, Japan',
    imageUrl: u('1642347673791-a910bff6ee78', ART), // portrait 4:5
    sortOrder: 3,
    isFeatured: true,
  },
  {
    slug: 'ws-pampas',
    title: 'Pampas',
    galleryslug: 'dried-fallen',
    description: 'Soft plumes of dried grass filling the frame in pale straw.',
    year: 2020,
    location: 'Gotland, Sweden',
    imageUrl: u('1578500523703-2201d5f03bcb', ART), // landscape 3:2
    sortOrder: 4,
  },
  {
    slug: 'ws-last-maple',
    title: 'Last Maple',
    galleryslug: 'dried-fallen',
    description: 'Fallen maple leaves at ground level as the light goes.',
    year: 2023,
    location: 'Nikko, Japan',
    imageUrl: u('1476458393436-fb857cc4c7b5', ART), // landscape 3:2
    sortOrder: 5,
  },
  {
    slug: 'ws-leaf-shadow',
    title: 'Leaf Shadow',
    galleryslug: 'dried-fallen',
    description: 'The shadow of a tree moving across rough plaster in late sun.',
    year: 2025,
    location: 'Kanazawa, Japan',
    imageUrl: u('1771086604156-5832dafe4854', ART), // portrait 2:3
    sortOrder: 6,
    isLimitedEdition: true,
    editionSize: 50,
  },

  // Mist
  {
    slug: 'ws-cedar-fog',
    title: 'Cedar Fog',
    galleryslug: 'mist',
    description: 'A ridge of cedars fading into morning cloud.',
    year: 2022,
    location: 'Kumano Kodo, Japan',
    imageUrl: u('1444724334165-e7050f2229a1', ART), // portrait 2:3
    sortOrder: 1,
  },
  {
    slug: 'ws-temple-steps',
    title: 'Temple Steps',
    galleryslug: 'mist',
    description: 'Worn stone steps rising to a shrine in autumn rain.',
    year: 2024,
    location: 'Daisen, Japan',
    imageUrl: u('1766586591422-deae3b8d217c', ART), // landscape 3:2
    sortOrder: 2,
    isFeatured: true,
  },
  {
    slug: 'ws-still-pond',
    title: 'Still Pond',
    galleryslug: 'mist',
    description: 'A lily pond under fog, the far shore barely there.',
    year: 2023,
    location: 'Olympic Peninsula, USA',
    imageUrl: u('1726480244470-62c21ad2fc17', ART), // landscape 3:2
    sortOrder: 3,
    isFeatured: true,
  },
  {
    slug: 'ws-low-cloud',
    title: 'Low Cloud',
    galleryslug: 'mist',
    description: 'Cloud settling into the folds of a forested mountain.',
    year: 2021,
    location: 'Hakone, Japan',
    imageUrl: u('1701518358370-22ce0e925e06', ART), // portrait 3:4
    sortOrder: 4,
  },
  {
    slug: 'ws-rain-glass',
    title: 'Rain on Glass',
    galleryslug: 'mist',
    description: 'Trees blurred to grey shapes behind a rain-covered window.',
    year: 2019,
    location: 'Vancouver, Canada',
    imageUrl: u('1433863448220-78aaa064ff47', ART), // landscape 16:9
    sortOrder: 5,
    isLimitedEdition: true,
    editionSize: 100,
  },
]
