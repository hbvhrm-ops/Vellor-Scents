
// Curated product data for the Vellor Scents collection
import { Perfume } from './types';

export const PERFUMES: Perfume[] = [
  {
    id: '1',
    name: 'Vellor Rose Oud',
    brand: 'Vellor Scents',
    category: 'Oriental',
    price: 145.00,
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
    description: 'A deep, mysterious blend of velvet rose and precious oud wood, creating an atmosphere of regal elegance.',
    topNotes: ['Damask Rose', 'Saffron'],
    middleNotes: ['Oud Wood', 'Praline'],
    baseNotes: ['Vanilla', 'Clove']
  },
  {
    id: '2',
    name: 'Azure Breeze',
    brand: 'Vellor Scents',
    category: 'Fresh',
    price: 110.00,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600',
    description: 'The crisp air of the Mediterranean coast, captured in a bottle. Sparkling citrus and salty sea spray.',
    topNotes: ['Bergamot', 'Lemon'],
    middleNotes: ['Sea Salt', 'Neroli'],
    baseNotes: ['White Musk', 'Ambergris']
  },
  {
    id: '3',
    name: 'Sandalwood Sanctum',
    brand: 'Vellor Scents',
    category: 'Woody',
    price: 130.00,
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600',
    description: 'A spiritual journey through ancient forests. Warm, creamy sandalwood mixed with sacred incense.',
    topNotes: ['Cardamom', 'Violet'],
    middleNotes: ['Sandalwood', 'Papyrus'],
    baseNotes: ['Cedar', 'Leather']
  }
];
