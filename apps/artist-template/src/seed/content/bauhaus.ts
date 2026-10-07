import type { ArtworkSeed, GallerySeed } from '../demo-content'

// Bauhaus set: architectural and graphic photography — Dessau, Berlin,
// Stuttgart's Weissenhof, the Barcelona Pavilion, and the stairwells, planes
// and primary-colour details of modernist building. Every image ID was
// downloaded and visually checked (CGI renders, off-palette and ornate shots
// dropped). Orientation is noted per image because the home carousel is
// full-bleed wide. Six pieces featured (all landscape), three limited editions.

const COVER = 'auto=format&fit=crop&w=900&q=75'
const ART = 'auto=format&fit=crop&w=1200&q=75'
const u = (id: string, params: string) => `https://images.unsplash.com/photo-${id}?${params}`

export const bauhausGalleries: GallerySeed[] = [
  {
    slug: 'form-plane',
    name: 'Form & Plane',
    description: 'Walls, roofs and volumes reduced to edge, shadow and surface.',
    coverImageUrl: u('1781448009979-418f192d1d58', COVER), // landscape 3:2
    sortOrder: 1,
  },
  {
    slug: 'stairs-structure',
    name: 'Stairs & Structure',
    description: 'Spirals, switchbacks and stair runs seen as pure geometry.',
    coverImageUrl: u('1588680152893-a4b533646c6e', COVER), // landscape 4:3
    sortOrder: 2,
  },
  {
    slug: 'primary-colour',
    name: 'Primary Colour',
    description: 'Red, yellow and blue against white wall and open sky.',
    coverImageUrl: u('1594478482579-92d8fa3f4a40', COVER), // landscape 3:2
    sortOrder: 3,
  },
  {
    slug: 'facade',
    name: 'Facade',
    description: 'Glass curtain, ribbon window and balcony at Dessau and Weissenhof.',
    coverImageUrl: u('1640113038160-d1ec534515e9', COVER), // landscape 4:3
    sortOrder: 4,
  },
]

export const bauhausArtworks: ArtworkSeed[] = [
  // Form & Plane
  {
    slug: 'bh-sawtooth',
    title: 'Sawtooth',
    galleryslug: 'form-plane',
    description: 'The Bauhaus-Archiv roofline cut flat against a white sky.',
    year: 2023,
    location: 'Berlin, Germany',
    imageUrl: u('1558087060-3972a0d08fb4', ART), // landscape 4:3
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'bh-pavilion',
    title: 'Pavilion',
    galleryslug: 'form-plane',
    description: 'One roof plane, travertine, green marble and glass, nothing more.',
    year: 2024,
    location: 'Barcelona, Spain',
    imageUrl: u('1781448009979-418f192d1d58', ART), // landscape 3:2
    sortOrder: 2,
    isFeatured: true,
  },
  {
    slug: 'bh-corner',
    title: 'Corner',
    galleryslug: 'form-plane',
    description: 'A ribbed white corner rising into a pale, empty sky.',
    year: 2021,
    location: 'Berlin, Germany',
    imageUrl: u('1564566698730-9903b9e4a08c', ART), // landscape 3:2
    sortOrder: 3,
  },
  {
    slug: 'bh-intersecting-planes',
    title: 'Intersecting Planes',
    galleryslug: 'form-plane',
    description: 'Rendered walls stacked and slotted until the sky becomes a shape.',
    year: 2022,
    location: 'Porto, Portugal',
    imageUrl: u('1622396481322-3b83d186701b', ART), // portrait 2:3
    sortOrder: 4,
  },
  {
    slug: 'bh-cantilever',
    title: 'Cantilever',
    galleryslug: 'form-plane',
    description: 'Balcony boxes pushed out into black shadow, one over the next.',
    year: 2020,
    location: 'Rotterdam, Netherlands',
    imageUrl: u('1553178227-fae128903f42', ART), // portrait 3:4
    sortOrder: 5,
    isLimitedEdition: true,
    editionSize: 50,
  },

  // Stairs & Structure
  {
    slug: 'bh-sawtooth-stair',
    title: 'Stair in Section',
    galleryslug: 'stairs-structure',
    description: 'A white stair stringer reads as a single zigzag line.',
    year: 2022,
    location: 'Lisbon, Portugal',
    imageUrl: u('1588680152893-a4b533646c6e', ART), // landscape 4:3
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'bh-descent',
    title: 'Descent',
    galleryslug: 'stairs-structure',
    description: 'Looking down a stone spiral that tightens to a point.',
    year: 2019,
    location: 'Vienna, Austria',
    imageUrl: u('1448454050639-2f8d4bf26975', ART), // landscape 4:3
    sortOrder: 2,
  },
  {
    slug: 'bh-checkerboard-spiral',
    title: 'Checkerboard Spiral',
    galleryslug: 'stairs-structure',
    description: 'Black handrail coiling over a chequered floor five storeys down.',
    year: 2021,
    location: 'Hamburg, Germany',
    imageUrl: u('1542795677-94217fbdc703', ART), // portrait 4:5
    sortOrder: 3,
  },
  {
    slug: 'bh-hexagon',
    title: 'Hexagon',
    galleryslug: 'stairs-structure',
    description: 'A six-sided stairwell in cold blue, nested to infinity.',
    year: 2023,
    location: 'Copenhagen, Denmark',
    imageUrl: u('1548318281-7da3085ce691', ART), // portrait 3:4
    sortOrder: 4,
    isLimitedEdition: true,
    editionSize: 25,
  },
  {
    slug: 'bh-switchback',
    title: 'Switchback',
    galleryslug: 'stairs-structure',
    description: 'An external stair turns a white facade into a diagonal rhythm.',
    year: 2024,
    location: 'Milan, Italy',
    imageUrl: u('1696787717706-d9d9fc9313fe', ART), // portrait 9:16
    sortOrder: 5,
  },
  {
    slug: 'bh-helix',
    title: 'Helix',
    galleryslug: 'stairs-structure',
    description: 'A steel spiral stair climbing its mast into evening blue.',
    year: 2020,
    location: 'Stuttgart, Germany',
    imageUrl: u('1594818897200-2f5535262e08', ART), // landscape 3:2
    sortOrder: 6,
  },

  // Primary Colour
  {
    slug: 'bh-red-yellow-blue',
    title: 'Red, Yellow, Blue',
    galleryslug: 'primary-colour',
    description: 'Fifteen windows, three colours, one grid.',
    year: 2023,
    location: 'Lyon, France',
    imageUrl: u('1594478482579-92d8fa3f4a40', ART), // landscape 3:2
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'bh-red-wedge',
    title: 'Red Wedge',
    galleryslug: 'primary-colour',
    description: 'A faceted red roof breaks into a pale sky.',
    year: 2022,
    location: 'Oslo, Norway',
    imageUrl: u('1495085461086-ae0ad0a8fd74', ART), // landscape 3:2
    sortOrder: 2,
    isFeatured: true,
  },
  {
    slug: 'bh-red-doors',
    title: 'Red Doors',
    galleryslug: 'primary-colour',
    description: 'The Bauhaus entrance, its red doors under the glass bridge.',
    year: 2024,
    location: 'Dessau, Germany',
    imageUrl: u('1652823843818-f8ce45089417', ART), // landscape 5:4
    sortOrder: 3,
  },
  {
    slug: 'bh-red-ridge',
    title: 'Red Ridge',
    galleryslug: 'primary-colour',
    description: 'Ribbed red cladding stepping up into deep blue.',
    year: 2021,
    location: 'Amsterdam, Netherlands',
    imageUrl: u('1567193379153-5235c7f2c1b6', ART), // portrait 2:3
    sortOrder: 4,
  },
  {
    slug: 'bh-yellow-white',
    title: 'Yellow / White',
    galleryslug: 'primary-colour',
    description: 'Two coats of paint meet at a corner and make a composition.',
    year: 2025,
    location: 'Valencia, Spain',
    imageUrl: u('1750412572142-2fe98237fd21', ART), // portrait 9:16
    sortOrder: 5,
  },

  // Facade
  {
    slug: 'bh-dessau',
    title: 'Dessau',
    galleryslug: 'facade',
    description: 'The workshop wing and its vertical lettering, as Gropius drew it.',
    year: 2023,
    location: 'Dessau, Germany',
    imageUrl: u('1640113038160-d1ec534515e9', ART), // landscape 4:3
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'bh-prellerhaus',
    title: 'Prellerhaus',
    galleryslug: 'facade',
    description: 'The studio block head-on, every balcony a small grey ledge.',
    year: 2022,
    location: 'Dessau, Germany',
    imageUrl: u('1652823759251-ede219f4681f', ART), // square 1:1
    sortOrder: 2,
  },
  {
    slug: 'bh-balconies',
    title: 'Balconies',
    galleryslug: 'facade',
    description: 'White slabs stacked against a hard blue sky.',
    year: 2024,
    location: 'Dessau, Germany',
    imageUrl: u('1648104265219-e72852f67726', ART), // landscape 3:2
    sortOrder: 3,
  },
  {
    slug: 'bh-night-workshop',
    title: 'Night Workshop',
    galleryslug: 'facade',
    description: 'Red light in the windows as the Bauhaus goes dark.',
    year: 2021,
    location: 'Dessau, Germany',
    imageUrl: u('1608700272578-057e251574b3', ART), // portrait 2:3
    sortOrder: 4,
    isLimitedEdition: true,
    editionSize: 100,
  },
  {
    slug: 'bh-ribbon-window',
    title: 'Ribbon Window',
    galleryslug: 'facade',
    description: 'Two bands of glass running the length of a white wall.',
    year: 2019,
    location: 'Dessau, Germany',
    imageUrl: u('1609264078294-f01ddaf588dc', ART), // landscape 3:2
    sortOrder: 5,
  },
  {
    slug: 'bh-weissenhof',
    title: 'Weissenhof',
    galleryslug: 'facade',
    description: 'A white house on the 1927 estate, still sharp a century on.',
    year: 2025,
    location: 'Stuttgart, Germany',
    imageUrl: u('1664997096349-35ccc8a35a40', ART), // landscape 3:2
    sortOrder: 6,
  },
]
