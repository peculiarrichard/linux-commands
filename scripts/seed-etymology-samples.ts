import "dotenv/config";
import { pathToFileURL } from "url";
import { connectToDatabase } from "../lib/db";
import CommandModel from "../models/Command";

// Researched via web search (not recalled from memory) so the citation URLs
// are real and the facts are verifiable — see docs/etymology-content-guide.md
// for the sourcing standard this is meant to demonstrate.
const ETYMOLOGY_SAMPLES: {
  slug: string;
  text: string;
  sources: string[];
}[] = [
  {
    slug: "grep",
    text: 'The name comes directly from the ed editor command g/re/p ("global regular expression print"). Ken Thompson pulled the regex engine out of ed into a standalone program, and when asked what the odd name meant, said it was simply the ed command it simulated.',
    sources: ["https://en.wikipedia.org/wiki/Grep"],
  },
  {
    slug: "awk",
    text: "The name is literally the initials of its three authors at Bell Labs — Alfred Aho, Peter Weinberger, and Brian Kernighan — who wrote the original version in 1977.",
    sources: [
      "https://en.wikipedia.org/wiki/AWK",
      "https://www.gnu.org/software/gawk/manual/html_node/History.html",
    ],
  },
  {
    slug: "sed",
    text: 'Short for "stream editor," written by Lee E. McMahon at Bell Labs (1973-74). It was motivated by wanting a non-interactive analogue of grep\'s substitution behavior (referred to internally during development as "g/re/s") rather than a new one-off tool for every ed-style operation.',
    sources: ["https://en.wikipedia.org/wiki/Sed"],
  },
  {
    slug: "tar",
    text: 'Short for "tape archive." It replaced two earlier, more primitive Unix backup tools (tp, and before that tap) built around the same fixed-block tape model — which is why the format still works the way it does even though almost nobody uses it with an actual tape drive anymore.',
    sources: ["https://stevens.netmeister.org/615/tar.html"],
  },
];

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  if (dryRun) {
    console.log(JSON.stringify(ETYMOLOGY_SAMPLES, null, 2));
    return;
  }

  await connectToDatabase();

  let updated = 0;
  let skipped = 0;

  for (const sample of ETYMOLOGY_SAMPLES) {
    const result = await CommandModel.updateOne(
      { slug: sample.slug },
      {
        $set: {
          "rationale.text": sample.text,
          "rationale.sources": sample.sources,
        },
      },
    );

    if (result.matchedCount === 0) {
      console.warn(`No command with slug "${sample.slug}" found — skipping.`);
      skipped++;
    } else {
      updated++;
    }
  }

  console.log(`Etymology seed complete: ${updated} updated, ${skipped} skipped (not found).`);
  process.exit(0);
}

const isMainModule = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;

if (isMainModule) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
