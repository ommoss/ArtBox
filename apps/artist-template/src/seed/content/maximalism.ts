import type { ArtworkSeed, GallerySeed } from '../demo-content'

// Maximalism set: saturated colour photography — spice stalls, woven textiles
// and zellige, flower markets and tulip fields, the painted houses of Burano,
// La Boca and Valparaíso, Holi powder, lanterns and Hong Kong neon. Every image
// ID was downloaded and visually checked (dull, duplicate, face-led and
// text-led shots dropped). Orientation is noted per image because the home
// carousel is full-bleed wide. Six pieces featured (five landscape), three
// limited editions.

const COVER = 'auto=format&fit=crop&w=900&q=75'
const ART = 'auto=format&fit=crop&w=1200&q=75'
const u = (id: string, params: string) => `https://images.unsplash.com/photo-${id}?${params}`

export const maximalismGalleries: GallerySeed[] = [
  {
    slug: 'market',
    name: 'Market',
    description: 'Spice pyramids, stacked weaves and tiled walls, piled as high as they go.',
    coverImageUrl: u('1525289722380-f5bf1653d504', COVER), // landscape 3:2
    sortOrder: 1,
  },
  {
    slug: 'bloom',
    name: 'Bloom',
    description: 'Flower stalls, dahlia baskets and fields striped in every colour at once.',
    coverImageUrl: u('1629725593792-727bbe2255b2', COVER), // landscape 3:2
    sortOrder: 2,
  },
  {
    slug: 'painted-streets',
    name: 'Painted Streets',
    description: 'Burano, La Boca and Valparaíso, where no two neighbours share a colour.',
    coverImageUrl: u('1618833236062-1bf980f31281', COVER), // landscape 4:3
    sortOrder: 3,
  },
  {
    slug: 'festival-neon',
    name: 'Festival & Neon',
    description: 'Holi powder by day, red lanterns and wet neon by night.',
    coverImageUrl: u('1502099530544-2b61cbaed85c', COVER), // landscape 3:2
    sortOrder: 4,
  },
]

export const maximalismArtworks: ArtworkSeed[] = [
  // Market
  {
    slug: 'mx-spice-grid',
    title: 'Spice Grid',
    galleryslug: 'market',
    description: 'Paprika, turmeric and sumac heaped into a chalk-labelled grid of ochre and rust.',
    year: 2023,
    location: 'Istanbul, Turkey',
    imageUrl: u('1525289722380-f5bf1653d504', ART), // landscape 3:2
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'mx-spice-tower',
    title: 'Spice Tower',
    galleryslug: 'market',
    description: 'Cones of saffron-yellow and brick-red spice under shelves of jarred rose and mint.',
    year: 2024,
    location: 'Marrakech, Morocco',
    imageUrl: u('1758745464235-ccb8c1253074', ART), // portrait 9:16
    sortOrder: 2,
  },
  {
    slug: 'mx-woven-stack',
    title: 'Woven Stack',
    galleryslug: 'market',
    description: 'Hundreds of folded weaves stacked in towers of cobalt, mustard and pink.',
    year: 2022,
    location: 'Oaxaca, Mexico',
    imageUrl: u('1722635941018-a9e7de0a5b1b', ART), // portrait 3:4
    sortOrder: 3,
    isLimitedEdition: true,
    editionSize: 50,
  },
  {
    slug: 'mx-hanging-weaves',
    title: 'Hanging Weaves',
    galleryslug: 'market',
    description: 'Magenta, turquoise and saffron runners hung edge to edge, every one embroidered.',
    year: 2021,
    location: 'Cusco, Peru',
    imageUrl: u('1772411535836-493bfc9b6f5f', ART), // portrait 2:3
    sortOrder: 4,
  },
  {
    slug: 'mx-flower-tile',
    title: 'Flower Tile',
    galleryslug: 'market',
    description: 'Hand-painted tiles of red blossoms and cobalt scrolls on a turquoise ground.',
    year: 2020,
    location: 'Shiraz, Iran',
    imageUrl: u('1519122114654-d665e49b122e', ART), // portrait 9:16
    sortOrder: 5,
  },
  {
    slug: 'mx-zellige',
    title: 'Zellige',
    galleryslug: 'market',
    description: 'Twelve-point stars in blue, green and gold repeating to the edge of the frame.',
    year: 2025,
    location: 'Fes, Morocco',
    imageUrl: u('1641302207066-fae4875554ab', ART), // landscape 3:2
    sortOrder: 6,
  },

  // Bloom
  {
    slug: 'mx-flower-stall',
    title: 'Flower Stall',
    galleryslug: 'bloom',
    description: 'A whole pavement given over to buckets of lilies, roses and hanging garlands.',
    year: 2022,
    location: 'Nice, France',
    imageUrl: u('1600104197373-c07cc35e4f61', ART), // landscape 3:2
    sortOrder: 1,
  },
  {
    slug: 'mx-crate-bloom',
    title: 'Crate Bloom',
    galleryslug: 'bloom',
    description: 'Sunflowers, violet stock and electric-blue iris jammed crate against crate.',
    year: 2023,
    location: 'Amsterdam, Netherlands',
    imageUrl: u('1693854921955-ef80053652aa', ART), // landscape 3:2
    sortOrder: 2,
  },
  {
    slug: 'mx-pink-tulips',
    title: 'Pink Tulips',
    galleryslug: 'bloom',
    description: 'A bucket of hot-pink tulips with orange ones crowding in behind.',
    year: 2021,
    location: 'Haarlem, Netherlands',
    imageUrl: u('1552826533-b8508864bcb3', ART), // square 1:1
    sortOrder: 3,
  },
  {
    slug: 'mx-dahlia-basket',
    title: 'Dahlia Basket',
    galleryslug: 'bloom',
    description: 'Magenta, crimson and tangerine dahlias spilling out of a garden trug.',
    year: 2024,
    location: 'Portland, United States',
    imageUrl: u('1724485755151-d81ff7a28269', ART), // portrait 3:4
    sortOrder: 4,
  },
  {
    slug: 'mx-striped-hills',
    title: 'Striped Hills',
    galleryslug: 'bloom',
    description: 'Red salvia, yellow marigold and lavender ploughed into rainbow bands across a hillside.',
    year: 2019,
    location: 'Furano, Japan',
    imageUrl: u('1629725593792-727bbe2255b2', ART), // landscape 3:2
    sortOrder: 5,
    isFeatured: true,
  },
  {
    slug: 'mx-tulip-riot',
    title: 'Tulip Riot',
    galleryslug: 'bloom',
    description: 'Scarlet and butter-yellow tulips packed so tight there is no ground left.',
    year: 2025,
    location: 'Lisse, Netherlands',
    imageUrl: u('1616704524533-99b96f87a513', ART), // portrait 2:3
    sortOrder: 6,
  },

  // Painted Streets
  {
    slug: 'mx-burano-dusk',
    title: 'Burano Dusk',
    galleryslug: 'painted-streets',
    description: 'Crimson, ochre and rose houses lining a canal that runs straight into the sunset.',
    year: 2022,
    location: 'Burano, Italy',
    imageUrl: u('1491900177661-4e1cd2d7cce2', ART), // landscape 3:2
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'mx-yellow-violet',
    title: 'Yellow, Violet',
    galleryslug: 'painted-streets',
    description: 'A sunflower-yellow house and a violet one sharing a wall and a green neighbour.',
    year: 2023,
    location: 'Burano, Italy',
    imageUrl: u('1618833236062-1bf980f31281', ART), // landscape 4:3
    sortOrder: 2,
    isFeatured: true,
  },
  {
    slug: 'mx-wash-day',
    title: 'Wash Day',
    galleryslug: 'painted-streets',
    description: 'Laundry strung across a tomato-red house and a sky-blue one with green shutters.',
    year: 2021,
    location: 'Burano, Italy',
    imageUrl: u('1600249381162-a08b37fed74d', ART), // portrait 2:3
    sortOrder: 3,
  },
  {
    slug: 'mx-caminito',
    title: 'Caminito',
    galleryslug: 'painted-streets',
    description: 'Corrugated tin painted red, orange, sky blue and yellow, one sheet at a time.',
    year: 2024,
    location: 'Buenos Aires, Argentina',
    imageUrl: u('1728954228908-8077d354d808', ART), // portrait 2:3
    sortOrder: 4,
  },
  {
    slug: 'mx-twin-doors',
    title: 'Twin Doors',
    galleryslug: 'painted-streets',
    description: 'Two doors muralled in fire red and electric blue, each sprouting a painted tree.',
    year: 2020,
    location: 'Valparaíso, Chile',
    imageUrl: u('1493210977798-4f655ac200a9', ART), // landscape 9:8
    sortOrder: 5,
    isLimitedEdition: true,
    editionSize: 100,
  },
  {
    slug: 'mx-cerro-colour',
    title: 'Cerro Colour',
    galleryslug: 'painted-streets',
    description: 'Cobalt, pink and lemon houses tumbling down the hill toward the port.',
    year: 2019,
    location: 'Valparaíso, Chile',
    imageUrl: u('1490782300182-697b80ad4293', ART), // landscape 16:10
    sortOrder: 6,
  },

  // Festival & Neon
  {
    slug: 'mx-holi-cloud',
    title: 'Holi Cloud',
    galleryslug: 'festival-neon',
    description: 'Magenta, violet and lime powder hanging over a crowd of raised arms.',
    year: 2023,
    location: 'Mathura, India',
    imageUrl: u('1603228254119-e6a4d095dc59', ART), // landscape 3:2
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'mx-colour-throw',
    title: 'Colour Throw',
    galleryslug: 'festival-neon',
    description: 'Yellow, pink and cyan clouds bursting over a festival crowd under blue sky.',
    year: 2019,
    location: 'Berlin, Germany',
    imageUrl: u('1468234847176-28606331216a', ART), // landscape 2:1
    sortOrder: 2,
  },
  {
    slug: 'mx-red-lanterns',
    title: 'Red Lanterns',
    galleryslug: 'festival-neon',
    description: 'Dozens of glowing red lanterns receding into the black of a festival night.',
    year: 2024,
    location: 'Taipei, Taiwan',
    imageUrl: u('1572940639050-49166eb37404', ART), // portrait 2:3
    sortOrder: 3,
    isLimitedEdition: true,
    editionSize: 25,
  },
  {
    slug: 'mx-lantern-glow',
    title: 'Lantern Glow',
    galleryslug: 'festival-neon',
    description: 'Painted paper lanterns burning orange against a dark wall of bokeh.',
    year: 2022,
    location: 'Kuala Lumpur, Malaysia',
    imageUrl: u('1613625695262-98bceeda4bc0', ART), // portrait 2:3
    sortOrder: 4,
  },
  {
    slug: 'mx-wet-neon',
    title: 'Wet Neon',
    galleryslug: 'festival-neon',
    description: 'Red, cyan and violet signs pooling on rain-slick pavement under umbrellas.',
    year: 2021,
    location: 'Kowloon, Hong Kong',
    imageUrl: u('1502099530544-2b61cbaed85c', ART), // landscape 3:2
    sortOrder: 5,
  },
  {
    slug: 'mx-mong-kok',
    title: 'Mong Kok',
    galleryslug: 'festival-neon',
    description: 'Red minibuses nose through a canyon of scarlet and teal neon.',
    year: 2025,
    location: 'Kowloon, Hong Kong',
    imageUrl: u('1616394158624-a2ba9cfe2994', ART), // portrait 2:3
    sortOrder: 6,
    isFeatured: true,
  },
]
