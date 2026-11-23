// Downloads the pinned trevs-monogram release (the 3D monogram shown in the top bar on
// desktop) from the private trevor4n/trevs-monogram repo into ./trevs-monogram/, which is
// gitignored and published with the rest of the site at /trevs-monogram/.
//
// Netlify runs this as the build command (netlify.toml). The version and checksum are pinned
// in package.json ("trevsMonogram"). Needs a GitHub token that can read that repo:
//   - on the host: the TREVS_MONOGRAM_TOKEN environment variable (fine-grained, read-only Contents)
//   - on your own machine: nothing to set, it uses the GitHub CLI's login (`gh auth token`)
// Fails the build if the download or checksum is wrong. Without the files the game still
// works: the monogram simply doesn't appear (see script.js).
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const REPO = 'trevor4n/trevs-monogram'
const ASSET = 'trevs-monogram-dist.tar.gz'
const { version, sha256 } = JSON.parse(readFileSync('package.json', 'utf8')).trevsMonogram
const dest = 'trevs-monogram'
const marker = join(dest, '.version')

const fail = (msg) => { console.error(`\nfetch-monogram: ${msg}\n`); process.exit(1) }

if (existsSync(marker) && readFileSync(marker, 'utf8') === `${version} ${sha256}`) {
  console.log(`fetch-monogram: trevs-monogram ${version} already in place`)
  process.exit(0)
}

let token = process.env.TREVS_MONOGRAM_TOKEN || process.env.TUN_MONOGRAM_TOKEN // the older variable name still works
if (!token) {
  try { token = execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() } catch { /* no GitHub CLI */ }
}
if (!token) fail('no GitHub token. Set TREVS_MONOGRAM_TOKEN (read-only Contents access to trevor4n/trevs-monogram), or log in with the GitHub CLI.')

const api = async (path, accept) => {
  const res = await fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: accept, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'sutton-fetch-monogram' },
  })
  if (!res.ok) fail(`GitHub answered ${res.status} for ${path}. Check that the token can read ${REPO} and that release v${version} exists.`)
  return res
}

const release = await (await api(`releases/tags/v${version}`, 'application/vnd.github+json')).json()
const asset = release.assets.find((a) => a.name === ASSET)
if (!asset) fail(`release v${version} has no ${ASSET}`)
const bytes = Buffer.from(await (await api(`releases/assets/${asset.id}`, 'application/octet-stream')).arrayBuffer())

const got = createHash('sha256').update(bytes).digest('hex')
if (got !== sha256) fail(`checksum mismatch for v${version}.\n  expected ${sha256}\n  got      ${got}\nIf the release was rebuilt on purpose, update "trevsMonogram.sha256" in package.json.`)

const tarball = join(tmpdir(), `trevs-monogram-${version}-${process.pid}.tar.gz`)
writeFileSync(tarball, bytes)
rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })
try { execFileSync('tar', ['-xzf', tarball, '-C', dest]) } finally { rmSync(tarball, { force: true }) }

rmSync(join(dest, 'icons'), { recursive: true, force: true }) // the tab icon isn't used here
writeFileSync(marker, `${version} ${sha256}`)
console.log(`fetch-monogram: trevs-monogram ${version} downloaded and verified`)
