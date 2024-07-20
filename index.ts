import { z } from "zod";

const TrigramsSchema = z.record(
  z.string(),
  z.record(z.string(), z.coerce.number())
);
const BigramsSchema = z.record(z.string(), z.coerce.number());
const LengthsSchema = z.array(z.coerce.number());

type Trigrams = z.infer<typeof TrigramsSchema>;
type Bigrams = z.infer<typeof BigramsSchema>;
type Lengths = z.infer<typeof LengthsSchema>;

/**
 * Reads JSON data from a local file and validates it against a Zod schema.
 *
 * @param path - The file path.
 * @param schema - The Zod schema to validate the data.
 * @returns The parsed JSON data.
 */
async function readJSON<T>(path: string, schema: z.ZodSchema<T>): Promise<T> {
  const file = await Bun.file(path);
  const json = await file.json();
  return schema.parse(json);
}

/**
 * Fills a word up to the desired length using trigrams.
 *
 * @param word - The initial part of the word.
 * @param length - The desired length of the final word.
 * @param trigrams - The trigrams data.
 * @param rand - Optional random selection function.
 * @returns The completed word.
 */
function fillWord(
  word: string,
  length: number,
  trigrams: Trigrams,
  rand: (list: { [key: string]: number }) => string = arrayWeightedRand
): string {
  while (word.length < length) {
    const tail = word.slice(-2) || word;
    if (!trigrams[tail]) {
      return word;
    }
    word += rand(trigrams[tail]);
  }
  return word;
}

/**
 * Selects a weighted random key from an object.
 *
 * @param list - The object with keys and their weights.
 * @returns The selected key.
 */
function arrayWeightedRand(list: { [key: string]: number }): string {
  let totalWeight = 0;
  for (const weight of Object.values(list)) {
    if (weight < 0) {
      throw new Error("Weights cannot be negative.");
    }
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    throw new Error("Total weight must exceed zero.");
  }

  let rand = Math.floor(Math.random() * totalWeight) + 1;
  for (const [key, weight] of Object.entries(list)) {
    rand -= weight;
    if (rand <= 0) {
      return key;
    }
  }
  throw new Error("Random selection failed.");
}

// Example usage
async function generateWords() {
  const lengthsArray = await readJSON<Lengths>(
    "data/distinct_word_lengths.json",
    LengthsSchema
  );
  const bigrams = await readJSON<Bigrams>(
    "data/word_start_bigrams.json",
    BigramsSchema
  );
  const trigrams = await readJSON<Trigrams>(
    "data/trigrams.json",
    TrigramsSchema
  );

  // Convert lengths array to object format required by arrayWeightedRand
  const lengths = lengthsArray.reduce((acc, value, index) => {
    acc[index.toString()] = value;

    return acc;
  }, {} as { [key: string]: number });

  for (let i = 0; i < 50; i++) {
    let word: string;
    do {
      const length = arrayWeightedRand(lengths);
      const start = arrayWeightedRand(bigrams);
      word = fillWord(start, z.coerce.number().parse(length), trigrams);
    } while (!/[AEIOUY]/i.test(word));

    word = word.toLowerCase();
    console.log(word);
  }
}

generateWords().catch(console.error);
