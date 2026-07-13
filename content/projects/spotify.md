---
title: Spotify 2006
date: 2026-07-11
summary: A fully working music app — search, playback, playlists, and an AI DJ — reskinned into three completely different early-2000s looks you can switch between live.
cover: images/covers/spotify.png
tech: JavaScript, React, Vite, Zustand, Groq AI
event: RIFT
rank: Ranked #6
members: Sujatx, WINTYR, vellichor
github: https://github.com/KAPS-LOCK/spotify
live: https://spotify-drab-alpha.vercel.app/
---

## The idea

None of us had done a hackathon before, so we walked in with no real plan, just a want to build something that actually works and not just look like it works. The idea itself was easy to agree on: what if Spotify had launched in 2006, before everything on the internet turned flat and minimal.

The color palette was where we actually got stuck. We couldn't agree on one direction, so we just stopped trying to. Each of us picked our own path and ran with it, chrome and acid green, glassy aero blue, glittery scrapbook pink, and figured we'd smash them together at the end and see what happened. Somehow it worked. One shared engine underneath, three completely different pasts on top.

## Building it

Honestly the build itself was less about any one feature and more about how much we kept checking in with each other. Someone would get a layout half working and immediately show it to the group, someone else would catch a bug just by looking at it for ten seconds, and we'd bounce ideas back and forth until it clicked. A lot of it was just sitting next to each other figuring things out loud, going "wait try this" or "that's broken on my end" and fixing it together instead of separately.

That back and forth is probably the reason three very different themes ended up feeling like they belonged to the same app. Nobody built in a silo for too long. If something in the shared player broke because of one theme's CSS, we'd all drop what we were doing and sort it out together.

## What went wrong

It was a 24 hour run, and this was the first time the three of us had ever built something together. We did not do any proper planning going in, no roadmap, no task split on paper, nothing like that. We just trusted each other and started building, hoping it would come together by the deadline.

Mostly it did, but the seams showed where you'd expect. Getting three people's CSS to sit inside one shared shell without breaking each other's themes ate way more time than we budgeted for, especially once we started checking things on mobile and everything that looked fine on a laptop fell apart on a smaller screen. There was a stretch near the end that was just fixing overflow and z-index issues one by one.

## Where we landed

We placed 6th. First hackathon, no plan, 24 hours, sleep deprived, and somehow we walked away with three genuinely different apps all running off the same real, working core. That's the part that stuck with us more than the ranking, honestly. We showed up not really knowing what we were doing and just figured it out as a team.
