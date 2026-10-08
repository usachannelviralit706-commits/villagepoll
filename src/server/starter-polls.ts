// Seeded once into an empty database so the home page never looks empty.
export const STARTER_POLLS = [
  {
    id: 'pineapple',
    question: 'Does pineapple belong on pizza?',
    description: 'The internet’s oldest argument. Settle it once and for all.',
    category: 'Food',
    options: [
      { label: 'Yes, absolutely', votes: 412 },
      { label: 'No, never', votes: 389 },
      { label: 'Only with ham', votes: 127 },
    ],
  },
  {
    id: 'best-goat',
    question: 'Who is the greatest footballer of all time?',
    description: '',
    category: 'Sports',
    options: [
      { label: 'Lionel Messi', votes: 538 },
      { label: 'Cristiano Ronaldo', votes: 471 },
      { label: 'Pelé', votes: 143 },
      { label: 'Diego Maradona', votes: 118 },
    ],
  },
  {
    id: 'phone-os',
    question: 'iPhone or Android?',
    description: 'Which phone is in your pocket right now?',
    category: 'Tech',
    options: [
      { label: 'iPhone', votes: 302 },
      { label: 'Android', votes: 355 },
    ],
  },
  {
    id: 'morning-drink',
    question: 'What’s your go-to morning drink?',
    description: '',
    category: 'Lifestyle',
    options: [
      { label: 'Coffee', votes: 264 },
      { label: 'Tea', votes: 198 },
      { label: 'Water', votes: 87 },
      { label: 'Energy drink', votes: 41 },
    ],
  },
  {
    id: 'streaming',
    question: 'Which streaming service would you keep if you could only pick one?',
    description: '',
    category: 'Entertainment',
    options: [
      { label: 'Netflix', votes: 221 },
      { label: 'YouTube Premium', votes: 176 },
      { label: 'Disney+', votes: 94 },
      { label: 'Prime Video', votes: 133 },
    ],
  },
  {
    id: 'console',
    question: 'Best gaming platform right now?',
    description: '',
    category: 'Gaming',
    options: [
      { label: 'PC', votes: 288 },
      { label: 'PlayStation 5', votes: 241 },
      { label: 'Nintendo Switch', votes: 160 },
      { label: 'Xbox', votes: 97 },
    ],
  },
]
