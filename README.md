# Random Word Generator

This project generates pronounceable, random English-like words that don't exist, using a weighted n-gram approach. It is a TypeScript-based port of the original PHP project created by [pcrov](https://github.com/pcrov/Wordle).

---

## Installation

To install dependencies, run:

```bash
bun install
```

---

## Running the Project

To run the project, execute:

```bash
bun run index.ts
```

---

## Method & Data

The core idea is to generate words by predicting the next character based on the current sequence, using weighted bigrams and trigrams. Here’s a brief overview of the data files used:

- **`distinct_word_lengths.json`**:
  ```json
  [0, 26, 622, 4615, 6977, 10541, 13341, ...]
  ```
  Distribution of lengths of distinct words.

- **`word_start_bigrams.json`**:
  ```json
  {
    "TH": "82191954206",
    "HE": "9112438473",
    "IN": "27799770674",
    "ER": "324230831",
    ...
  }
  ```
  Bigrams (two-character combinations) and their frequencies at the start of words. This is used to determine the starting bigram for the generated words.

- **`trigrams.json`**:
  ```json
  {
    "TH": {
      "E": "69221160871",
      "A": "9447439870",
      "I": "6357454845",
      "O": "3369505315",
      "R": "1673179164",
      ...
    },
    "AN": {
      "D": "26468697834",
      "T": "3755591976",
      "C": "3061152975",
      ...
    },
    ...
  }
  ```
  Trigrams (three-character sequences) and the frequency of each possible next character following a given bigram. It helps in extending the word based on the last two characters.

---

### Utility Functions

- **`arrayWeightedRand()`**: Picks a weighted random key from an object.
- **`fillWord()`**: Builds a word up to a desired length using trigrams.

---

## Usage Example

Here’s an example of how to generate words:

```typescript
async function generateWords() {
  const lengthsArray = await readJSON<Lengths>("data/distinct_word_lengths.json", LengthsSchema);
  const bigrams = await readJSON<Bigrams>("data/word_start_bigrams.json", BigramsSchema);
  const trigrams = await readJSON<Trigrams>("data/trigrams.json", TrigramsSchema);

  // Convert lengths array to object format required by arrayWeightedRand
  const lengths = lengthsArray.reduce((acc, value, index) => {
    acc[index.toString()] = value;
    return acc;
  }, {} as { [key: string]: number });

  for (let i = 0; i < 50; i++) {
    let word: string;
    // Generate a word with at least one vowel
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
```

---

## Output

Running the script may yield results such as:

|             |            |              |                 |                |
|-------------|------------|--------------|-----------------|----------------|
| alic        | ingtharth  | narl         | coug            | bassanytel     |
| orestat     | conal      | entomed      | lactio          | bylve          |
| tervatesel  | thap       | bricestsimin | popers          | dastres        |
| remintse    | instoret   | dicas        | overeq          | dearcephs      |
| amesiblesse | conif      | ishathead    | jeconden        | rogy           |
| tordial     | canglypere | equagallyi   | onernell        | accure         |
| dograse     | meatimpona | putedif      | plichall        | betabou        |
| inve        | thater     | sevoing      | helleresseneter | cy             |
| thereinfig  | wardixes   | haterl       | coactemse       | encesimahapeon |
| tood        | offaxe     | blentsolli   | herritiol       | gaincell       |  
