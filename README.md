# Apex Backup

Scheduled exports of everything, so that no single account is ever the only copy.

**Status: not built. It is the most important repo here after the drive itself.**

## Why it matters more than it sounds

The drive's design deliberately deletes phone files once a verified copy is in the cloud.
That means the cloud copy becomes the only copy. If the B2 account is lost, locked or you
lose the keys, the originals are gone and the phone copies were already deleted.

This repo is the answer to that: a second, independent copy that you can hold in your hand.

## Where the copy should go

Your plan says GitHub. That is the wrong target for data:

- GitHub warns at 1 GB per repository and hard-limits files to 100 MB.
- A private repo full of personal data is one accidental visibility change from a disaster.
- Git is for text that changes in small diffs, not for photos.

Better targets, in order:

1. **Your own computer** — a download you run monthly, plus the phone. The only copy that
   survives a company disappearing.
2. **A second bucket on a different provider** — with a free tier and no card, that means
   another B2 account or a different service.
3. **Encrypted archives on a USB stick**, for the things you would be devastated to lose.

## What it should do

- Export the drive manifest as a plain JSON list of everything stored.
- Export account data from Firestore as JSON.
- Produce a single encrypted archive per export, with a checksum you can verify.

## What you need to do

1. Decide the second destination. A computer you own is the honest answer.

## First three steps

1. A script that lists every object in the bucket and writes a manifest file.
2. A verification pass that confirms each object still exists and matches its checksum.
3. A monthly reminder that will not be ignored.
