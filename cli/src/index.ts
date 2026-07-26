#!/usr/bin/env node

import { parseArgs } from "./args.js";
import { fetchCommand, getApiBaseUrl, searchCommands, type CommandDetail } from "./api.js";
import { accent, bold, dim } from "./format.js";

function printUsage() {
  console.log(`
${bold("linux-commands")} — terminal companion for the Linux Commands Hub

Usage:
  linux-commands <command>              Show details for a command (e.g. grep)
  linux-commands search <query>         Search commands by name/description
  linux-commands search <query> --page N   Show page N of search results
  linux-commands --help                 Show this help

Environment:
  LINUX_COMMANDS_API_URL   Base URL of the API (default: ${getApiBaseUrl()})
`);
}

function printCommand(command: CommandDetail) {
  console.log(`\n${bold(accent(command.name))} — ${command.description}`);

  if (command.aliases.length > 0) {
    console.log(dim(`aliases: ${command.aliases.join(", ")}`));
  }

  if (command.rationale.text) {
    console.log(`\n${bold("Why it's called that")}`);
    console.log(command.rationale.text);
  }

  if (command.options.length > 0) {
    console.log(`\n${bold("Options")}`);
    for (const option of command.options) {
      console.log(`  ${accent(option.flag.padEnd(20))} ${option.description}`);
    }
  }

  if (command.examples.length > 0) {
    console.log(`\n${bold("Examples")}`);
    for (const example of command.examples) {
      console.log(`  ${accent(example.command)}`);
      console.log(`    ${dim(example.explanation)}`);
    }
  }

  console.log("");
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.mode === "help") {
    printUsage();
    return;
  }

  if (parsed.mode === "search-missing-query") {
    console.error("Usage: linux-commands search <query>");
    process.exitCode = 1;
    return;
  }

  try {
    if (parsed.mode === "search") {
      const results = await searchCommands(parsed.query, parsed.page);
      if (results.items.length === 0) {
        console.log(`No commands matched "${parsed.query}".`);
        return;
      }
      console.log("");
      for (const item of results.items) {
        console.log(`${bold(accent(item.name))}  ${dim(item.description)}`);
      }
      console.log("");
      if (results.totalPages > 1) {
        const hasNext = results.page < results.totalPages;
        const hint = hasNext ? ` — run with --page ${results.page + 1} for more` : "";
        console.log(
          dim(`Page ${results.page} of ${results.totalPages} (${results.totalCount} total)${hint}`),
        );
        console.log("");
      }
    } else {
      const command = await fetchCommand(parsed.slug);
      printCommand(command);
    }
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  }
}

main();
