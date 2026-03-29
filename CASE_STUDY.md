# Journalist – Case Study

## Why I built this

I started learning programming a little over a year ago.  
I bought a frontend course and began working through HTML and CSS. That part was manageable.  

But when I got to JavaScript, after a couple of months I realized something wasn’t working.

The problem wasn’t the syntax. The problem was that everything I was learning existed in isolation. Small topics, small examples, no real context. I didn’t have anything my brain could “attach to” and truly understand.

I felt like I was learning pieces, but not how they work together.

At that point I understood that I won’t learn programming just by following a course.

So I made a decision:
→ I need to build something real  
→ something with a purpose  
→ something where problems are not artificial  

That’s how the idea for my portfolio started, and shortly after that — my first real project: Journalist.

---

## Why this project

For my first project, I wanted something:
- simple enough to finish  
- but useful enough to actually use  

I didn’t want to build something “just for code”.

So I thought about a journaling / notes app — something I could use daily:
- learning notes  
- shopping lists  
- planning  
- random thoughts  

At the same time, I had a bigger idea.

I want my portfolio to be more than just a list of projects.  
I want it to show:
- who I am  
- what I’m doing  
- how I learn  
- what problems I face and how I solve them  

That’s why Journalist is not just an app.  
It’s also becoming part of my portfolio as a **personal developer journal**.

Right now, me and my girlfriend already use it on our phones instead of default notes apps.

---

## Why vanilla JavaScript

I chose the frontend path, so JavaScript is my main tool.

I decided to build this project in vanilla JS on purpose.  
Before jumping into frameworks, I wanted to understand the fundamentals as deeply as possible.

How things actually work:
- DOM  
- events  
- state  
- rendering  
- data flow  

This project forced me to do that.

---

## What I built

Journalist is a minimalist journaling app.

From a user perspective, it allows:

- logging in with Google
- writing and saving entries in a simple editor
- viewing all entries in a list
- filtering entries by content and category
- opening a full detail view
- editing entries
- sharing entries via link

The goal was not just functionality, but a clean and natural writing experience.

---

## How it works

The app is built around a simple state-driven structure.

All data is stored in Firestore and loaded into a local `entries` array, which acts as the application state.

Whenever the data changes (create, edit, delete), the UI is re-rendered based on the current state.

The flow looks like this:

Firestore → entries (state) → UI

The application is organized into clear parts:

- data layer (Firestore operations)
- state (entries array)
- UI rendering (list view, detail view)
- events (user interactions)
- helpers (URL handling, clipboard, formatting)

This separation helped me keep the logic understandable and avoid mixing UI with data logic.

One important decision was to treat the URL as part of the application state.

By using query parameters (`?entry=`, `?share=`) and `history.pushState`, I was able to control navigation without reloading the page.

This allowed me to support both:
- private logged-in view  
- public read-only shared view  

---

## Challenges

Journalist was my first fully independent project built without following a tutorial.

I didn’t start this project knowing exactly what I was doing.  
The goal was to understand how real applications are built, not just how to write isolated code.

Because of that, almost every part of the project became a challenge at some point.

I got stuck many times. Some problems took hours, others took days.  
But this process forced me to actually understand what was happening instead of copying solutions.

### Mobile authentication

Firebase authentication worked on desktop, but failed on mobile.

`signInWithPopup` was not reliable, so I had to implement a separate flow using `signInWithRedirect` and handle `getRedirectResult()`.

This was my first experience dealing with environment-specific behavior.

---

### URL as application state

I wanted shared links to open a specific entry directly.

To achieve that, I introduced URL-based state using query parameters and `history.pushState`.

This required rethinking how navigation works without full page reloads.

---

### Dynamic UI and event handling

Because parts of the UI are rendered dynamically with `innerHTML`, event listeners had to be attached after rendering.

At first this caused bugs:
- missing listeners  
- duplicated listeners  

Fixing this helped me understand how DOM rendering and event binding actually work.

---

### Mobile UX issues

Many problems appeared only on mobile:

- textarea causing scroll jumps while typing  
- buttons staying in active/hover state  
- default tap highlight  
- layout breaking with long text  

Fixing those issues required both CSS changes and rethinking interaction behavior.

---

### Handling long content

Long entries exposed layout problems.

Text without spaces could break the layout and overflow outside the card.

I solved this using:
- `overflow-wrap`
- `word-break`
- improved textarea behavior

---

## What I learned

This project changed how I think about building applications.

Before, I was writing code.  
Now I’m thinking about systems.

### Application structure

I learned how different parts of an app depend on each other:
- data
- UI
- events

And how important it is to think ahead when writing code.

---

### Backend and data

This was my first real experience with persistent data.

I moved from localStorage to Firebase and Firestore, which helped me understand how real apps store and manage data.

---

### State and UI

One of the biggest shifts was understanding state.

Instead of updating the DOM everywhere, I started thinking:

→ change data → re-render UI

This made the app more predictable.

---

### Debugging

This project taught me real debugging.

Not tutorial debugging — real problems:
- things not working without clear reason
- bugs caused by small logic issues
- mobile-only issues

I had to read code carefully and understand what’s actually happening.

---

### UX and polish

At some point, the focus shifted from:
→ “make it work”  
to  
→ “make it feel right”

I started paying attention to:
- spacing  
- interactions  
- button behavior  
- small UX details  

This changed how I look at frontend completely.

---

### Working on a real project

This was my first time delivering a complete product:

- building features  
- fixing bugs  
- cleaning code  
- organizing structure  
- writing documentation  
- using GitHub  

I learned what it actually means to finish something.

---

## Result

Journalist is not just a CRUD app.

It is a complete working application with:
- authentication  
- backend integration  
- public sharing  
- mobile UX  
- polished interactions  

More importantly, it represents a shift in how I approach programming.

From writing code → to building real applications.