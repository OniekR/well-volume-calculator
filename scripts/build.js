#!/usr/bin/env node
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const outDir = path.resolve(__dirname, "..", "dist");

async function build(watch = false) {
  try {
    await esbuild.build({
      entryPoints: [path.resolve(__dirname, "..", "src", "js", "volume.entry.js")],
      bundle: true,
      minify: process.env.NODE_ENV === "production",
      sourcemap: true,
      format: "iife",
      globalName: "VolumeCalc",
      outfile: path.join(outDir, "keino.bundle.js"),
    });

    fs.mkdirSync(outDir, { recursive: true });
    fs.copyFileSync(path.resolve(__dirname, "..", "style.css"), path.join(outDir, "style.css"));
    fs.copyFileSync(
      path.resolve(__dirname, "..", "src", "css", "style.css"),
      path.join(outDir, "src-style.css")
    );
    console.log("Built dist/keino.bundle.js and copied CSS to dist/");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

if (process.argv.includes("--watch")) build(true);
else build(false);
