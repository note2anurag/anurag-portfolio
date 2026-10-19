import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Code2, Heart, Menu, Moon, Sun, X } from "lucide-react";
import { marked } from "marked";

type Page = "home" | "must-read" | "passions" | "story";
type Post = { slug: string; title: string; date: string; category: string; excerpt: string; content: string };

const postFiles = import.meta.glob("./posts/*.md", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;
const posts: Post[] = Object.entries(postFiles).map(([path, raw]) => {
  const meta = Object.fromEntries([...raw.matchAll(/^([a-zA-Z]+):\s*(.+)$/gm)].map(m => [m[1].toLowerCase(), m[2].trim()]));
  const content = raw.replace(/^---[\s\S]*?---\s*/, "");
  return {
    slug: path.split("/").pop()!.replace(/\.md$/, ""),
    title: meta.title ?? "Untitled post",
    date: meta.date ?? "Draft",
    category: meta.category ?? "Notes",
    excerpt: meta.excerpt ?? "",
    content
  };
}).sort((a, b) => b.date.localeCompare(a.date));

const nav: { id: Page; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "must-read", label: "Must Read" },
  { id: "passions", label: "Passions" },
  { id: "story", label: "My Story" }
];

function getRoute(): { page: Page; post?: string } {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const fallbackPath = new URLSearchParams(window.location.search).get("p");
  const path = (fallbackPath ? `${base}${fallbackPath.replace(/^\/+/, "")}` : window.location.pathname).replace(/\/+$/, "");
  const relative = path.startsWith(base) ? path.slice(base.length) : path.replace(/^\//, "");
  const parts = relative.split("/").filter(Boolean);
  if (parts[0] === "must-read" && parts[1]) return { page: "must-read", post: parts[1] };
  if (parts[0] === "must-read") return { page: "must-read" };
  if (parts[0] === "passions") return { page: "passions" };
  if (parts[0] === "story") return { page: "story" };
  return { page: "home" };
}
function urlFor(page: Page, post?: string) {
  const base = import.meta.env.BASE_URL;
  if (page === "home") return base;
  return `${base}${page === "must-read" ? "must-read/" : page === "passions" ? "passions/" : "story/"}${post ? `${post}/` : ""}`;
}
function App() {
  const [route, setRoute] = useState(getRoute);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("portfolio-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const onPop = () => setRoute(getRoute());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("portfolio-theme", theme); }, [theme]);
  useEffect(() => { window.scrollTo(0, 0); setMenuOpen(false); }, [route.page, route.post]);

  const navigate = (page: Page, post?: string) => {
    window.history.pushState({}, "", urlFor(page, post));
    setRoute({ page, post });
  };
  const selectedPost = posts.find(p => p.slug === route.post);
  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category)))];
  const filtered = useMemo(() => posts.filter(p =>
    (category === "All" || p.category === category) &&
    `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(query.toLowerCase())
  ), [category, query]);

  const openPost = (slug: string) => navigate("must-read", slug);

  return <div className="site-shell">
    <header className="topbar">
      <a href={urlFor("home")} className="wordmark" onClick={e => { e.preventDefault(); navigate("home"); }}>
        <span className="mark">ag<span>.</span></span><span className="wordmark-label">ANURAG GAUTAM</span>
      </a>
      <nav className={`nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
        {nav.map(item => <a key={item.id} href={urlFor(item.id)} className={route.page === item.id ? "active" : ""}
          onClick={e => { e.preventDefault(); navigate(item.id); }}>{item.label}{item.id === "must-read" && <span className="nav-count">{posts.length}</span>}</a>)}
      </nav>
      <div className="header-actions">
        <button className="icon-button theme-toggle" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun size={17}/> : <Moon size={17}/>}
        </button>
        <button className="icon-button menu-toggle" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
    </header>

    <main>
      {route.page === "home" && <Home navigate={navigate} openPost={openPost} />}
      {route.page === "must-read" && (selectedPost ? <Article post={selectedPost} back={() => navigate("must-read")} /> : <section className="page-section">
        <div className="eyebrow"><BookOpen size={14}/> THE READING ROOM</div>
        <h1 className="page-title">Must <span className="accent">Read.</span></h1>
        <p className="page-intro">Ideas worth keeping. Notes from things I build, things I learn, and things I can't stop thinking about. This is where all my writing lives.</p>
        <div className="post-tools">
          <label className="search-box"><span className="sr-only">Search posts</span><span className="search-glyph">⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the archive…" /></label>
          <div className="category-tabs" aria-label="Filter by category">{categories.map(c => <button key={c} onClick={() => setCategory(c)} className={category === c ? "selected" : ""}>{c}</button>)}</div>
        </div>
        <div className="post-list">{filtered.map((post, i) => <PostRow key={post.slug} post={post} index={i} onClick={() => openPost(post.slug)} />)}</div>
        {filtered.length === 0 && <div className="empty-state">No posts match that search yet. Try another phrase.</div>}
        <p className="archive-note"><span className="status-dot"/> {posts.length} {posts.length === 1 ? "piece" : "pieces"} in the archive <span className="muted">· More writing will appear here.</span></p>
      </section>)}
      {route.page === "passions" && <Passions />}
      {route.page === "story" && <Story />}
    </main>

    <footer className="footer">
      <a href={urlFor("home")} onClick={e => { e.preventDefault(); navigate("home"); }} className="footer-mark">ag.</a>
      <p>Made thoughtfully, one small detail at a time.</p>
      <div className="footer-right"><span>© {new Date().getFullYear()} Anurag Gautam</span><a href="mailto:note2anurag@outlook.com" aria-label="Email Anurag"><ArrowUpRight size={16}/></a></div>
    </footer>
  </div>;
}

function Home({ navigate, openPost }: { navigate: (p: Page) => void; openPost: (slug: string) => void }) {
  return <div className="home-page">
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="status-dot"/> UI ENGINEER · NOIDA, INDIA</div>
        <h1>I cultivate<br/><span className="hero-highlight">software</span><br/>that lasts<span className="accent">.</span></h1>
        <p className="hero-lede">I'm Anurag Gautam — software engineer, professional-cricket alumnus, and farmer. I bring a farmer's patience to engineering, a cricketer's team-first mindset to collaboration, and a deep curiosity for how systems really work.</p>
        <div className="hero-actions">
          <button className="button button-primary" onClick={() => navigate("must-read")}>Read my writing <ArrowUpRight size={16}/></button>
          <button className="button button-quiet" onClick={() => navigate("story")}>A little about me <ArrowRight size={16}/></button>
        </div>
        <div className="hero-meta"><span><Code2 size={15}/> React · TypeScript · Architecture · AI</span><span className="meta-divider">/</span><span>Curiosity, cultivated daily</span></div>
      </div>
      <div className="hero-art" aria-label="Abstract decorative technical illustration">
        <div className="art-grid"></div><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
        <div className="art-core"><span className="core-bracket">&lt;</span><span className="core-slash">/</span><span className="core-bracket">&gt;</span></div>
        <div className="art-label label-top"><span className="tiny-square"></span> DESIGN × ENGINEERING</div>
        <div className="art-label label-bottom">CURIOUS BY DEFAULT <ArrowDownRight size={14}/></div>
        <span className="art-coordinate">28° 32' N<br/>77° 23' E</span>
      </div>
      <div className="hero-index"><span>01</span><span className="index-line"></span><span>04</span></div>
    </section>

    <section className="intro-strip">
      <span className="strip-label">A QUICK INTRO</span>
      <p>I believe software is cultivated, not simply shipped. Strong foundations, patient iteration, careful observation, and a team that trusts one another help good ideas take root and scale.</p>
      <button className="round-link" aria-label="Read my story" onClick={() => navigate("story")}><ArrowUpRight size={18}/></button>
    </section>

    <section className="home-lower">
      <div className="section-heading"><div><div className="eyebrow">FROM MY NOTEBOOK</div><h2>Worth your <span className="accent">time.</span></h2></div><button className="text-link" onClick={() => navigate("must-read")}>All posts <ArrowRight size={15}/></button></div>
      {posts.length ? <div className="featured-posts">{posts.slice(0, 2).map((post, i) => <PostRow key={post.slug} post={post} index={i} onClick={() => openPost(post.slug)} />)}</div> : <div className="empty-card"><BookOpen size={20}/><div><strong>The notebook is open.</strong><p>Your first post will show up here. Add a Markdown file to <code>src/posts/</code> to publish it.</p></div></div>}
    </section>

    <section className="explore-grid">
      <button className="explore-card" onClick={() => navigate("passions")}><span className="card-kicker">BEYOND THE SCREEN / 02</span><span className="explore-icon"><Heart size={19}/></span><strong>What I cultivate</strong><p>Farming, cricket, technology, travel, and the curiosity that connects them.</p><span className="card-arrow"><ArrowUpRight size={18}/></span></button>
      <button className="explore-card" onClick={() => navigate("story")}><span className="card-kicker">THE LONGER VERSION / 03</span><span className="explore-icon"><Code2 size={19}/></span><strong>From the pitch to production</strong><p>The journey from professional cricket into engineering, and the mindset that came along.</p><span className="card-arrow"><ArrowUpRight size={18}/></span></button>
    </section>
    <section className="contact-section" id="contact">
      <div><div className="eyebrow">LET'S CONNECT</div><h2>Good work starts<br/>with a <span className="accent">conversation.</span></h2><p>Have an interesting engineering problem, a thoughtful idea, or a reason to collaborate? I'd be glad to hear from you.</p></div>
      <div className="contact-links"><a href="mailto:note2anurag@outlook.com"><span>Email</span><strong>note2anurag@outlook.com</strong><ArrowUpRight size={17}/></a><a href="tel:+919262748948"><span>Phone</span><strong>+91 92627 48948</strong><ArrowUpRight size={17}/></a></div>
    </section>
  </div>;
}

function PostRow({ post, index, onClick }: { post: Post; index: number; onClick: () => void }) {
  return <button className="post-row" onClick={onClick}>
    <span className="post-number">{String(index + 1).padStart(2, "0")}</span>
    <span className="post-main"><span className="post-category">{post.category}</span><strong>{post.title}</strong><span className="post-excerpt">{post.excerpt}</span></span>
    <span className="post-date">{post.date}</span><span className="post-arrow"><ArrowUpRight size={18}/></span>
  </button>;
}
function Article({ post, back }: { post: Post; back: () => void }) {
  const html = marked.parse(post.content) as string;
  return <article className="article-page">
    <button className="back-link" onClick={back}><ArrowLeft size={15}/> All writing</button>
    <div className="eyebrow">{post.category.toUpperCase()} <span className="meta-divider">/</span> {post.date}</div>
    <h1 className="article-title">{post.title}</h1><p className="article-deck">{post.excerpt}</p>
    <div className="article-rule"></div>
    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
    <div className="article-end"><span className="accent">✳</span><p>Thanks for reading.</p><button className="text-link" onClick={back}>Back to Must Read <ArrowRight size={15}/></button></div>
  </article>;
}
function Passions() {
  const items = [
    { n: "01", title: "Farming: patience, seasons, and foundations", tag: "THE CULTIVATOR", desc: "I am a farmer, and that part of my life is more than a label. Farming asks you to respect foundations, notice small changes, work with uncertainty, and understand that meaningful results take time. I see a parallel in software: cultivate the conditions for healthy growth, keep tending the details, and don't confuse activity with progress.", icon: <Heart size={20}/> },
    { n: "02", title: "Professional cricket & team spirit", tag: "THE TEAMMATE", desc: "I took a sabbatical from engineering to pursue cricket professionally and represented the Sikkim Cricket Association in the Vijay Hazare Trophy, Vijay Merchant Trophy, and Senior Division inter-state and intra-district tournaments. The game built discipline, resilience, strategic thinking, adaptability, and respect for the team effort behind every result.", icon: <ArrowUpRight size={20}/> },
    { n: "03", title: "Technology: understanding the whole system", tag: "THE BUILDER", desc: "I'm drawn to the details beneath the surface: frontend architecture, React and TypeScript, state and data flow, authentication, testing, developer tooling, AI integrations, and the trade-offs that make systems maintainable. I want to understand why something works, not only how to make it work once.", icon: <Code2 size={20}/> },
    { n: "04", title: "Travel, sport & discovery", tag: "THE EXPLORER", desc: "Travel and sport keep me curious beyond a screen. Different places and different people challenge assumptions, broaden perspective, and remind me that learning happens outside formal plans as often as inside them.", icon: <BookOpen size={20}/> },
    { n: "05", title: "Technical writing & deep dives", tag: "THE NOTE-TAKER", desc: "Writing is how I organise what I learn. I want this site to hold practical breakdowns of engineering decisions, architecture, debugging, performance, AI workflows, and the lessons that emerge from building and maintaining real products. The Must Read archive is the home for all of it.", icon: <BookOpen size={20}/> }
  ];
  return <section className="page-section passions-page"><div className="eyebrow"><Heart size={14}/> THE THINGS THAT SHAPE ME</div><h1 className="page-title">Cultivated <span className="accent">over time.</span></h1><p className="page-intro">I don't separate curiosity from character. Farming, cricket, and software each teach me to pay attention, build foundations, learn from feedback, and keep showing up.</p><div className="story-callout"><span className="quote-mark">“</span><p>Plant with intention. Practise with discipline. Build with the team. Give good things time to grow.</p><span className="quote-credit">The thread connecting my fields, the cricket pitch, and software engineering.</span></div><div className="passion-list">{items.map(item => <div className="passion-row" key={item.n}><span className="passion-num">{item.n}</span><div className="passion-icon">{item.icon}</div><div className="passion-copy"><span className="post-category">{item.tag}</span><h2>{item.title}</h2><p>{item.desc}</p></div><span className="passion-star">✳</span></div>)}</div><p className="editable-note">This page reflects the interests and experiences I have chosen to share: farming, cricket, technology, travel, sport, and the habit of learning in public.</p></section>;
}
function Story() {
  return <section className="page-section story-page"><div className="eyebrow"><Code2 size={14}/> THE PERSON BEHIND THE PIXELS</div><h1 className="page-title">A mindset <span className="accent">cultivated.</span></h1><p className="page-intro">My path hasn't been a straight line from classroom to code. It has moved through the cricket ground, farming, and software engineering—and each chapter has shaped how I work with people and solve problems.</p>
    <div className="story-callout"><span className="quote-mark">“</span><p>I cultivate software with a farmer's patience and a cricketer's team spirit.</p><span className="quote-credit">A personal philosophy built from the paths I've walked.</span></div>
    <div className="story-content"><div className="story-aside"><span className="post-category">CURRENT CHAPTER</span><strong>Engineering with intent</strong><span className="aside-line"></span><span className="muted">Noida, India</span><a className="text-link" href="mailto:note2anurag@outlook.com">Get in touch <ArrowUpRight size={14}/></a></div><div className="story-body">
      <h2>My foundation: farming</h2><p>I am a farmer. Farming teaches a practical kind of patience: prepare the ground, understand the conditions, keep observing, make adjustments, and respect the time it takes for effort to become a result. It rewards consistency more than shortcuts.</p><p>That mindset translates naturally into engineering for me. Architecture is the ground beneath a product. Good abstractions are foundations. Monitoring and feedback help us notice when conditions change. Sustainable software, like a healthy crop, depends on the work that happens before the visible result.</p>
      <h2>The cricket chapter</h2><p>I took a sabbatical from engineering to pursue my passion for cricket at a professional level. I represented the Sikkim Cricket Association in the Vijay Hazare Trophy, Vijay Merchant Trophy, and Senior Division inter-state and intra-district tournaments.</p><p>Professional sport taught me discipline, resilience, continuous self-improvement, and how to perform under pressure. It also taught me that individual skill is only one part of a result: teamwork, adaptability, communication, and strategic planning matter just as much. The experience remains part of how I approach challenges in technology today.</p>
      <h2>The transition into software</h2><p>I brought that same practice-oriented mindset into engineering: learn the fundamentals, keep refining the craft, take responsibility for the outcome, and stay open to feedback. Over time, my work has grown from building responsive interfaces to thinking more deeply about architecture, performance, production reliability, testing, and AI-enabled workflows.</p>
      <h2>What I work on</h2><p>I am a software engineer with 6+ years of experience delivering enterprise web applications across projects for Cisco and Microsoft, with earlier experience at Magic EdTech, Rapidsoft Technologies, and Amocabs. My core strengths are frontend engineering, React, TypeScript, scalable UI architecture, and turning complex workflows into clear, reliable user experiences.</p>
      <ul><li><strong>AI-enabled experiences:</strong> Built an AI-powered performance-summary capability for Cisco's MyPerformance platform and worked on contextual insights, prompt workflows, and response orchestration.</li><li><strong>Platform reliability:</strong> Worked on connection pooling and performance optimisation, plus enterprise authentication flows across browser and embedded WebEx environments.</li><li><strong>Renewals and quoting:</strong> Managed complex asynchronous state using Redux and RxJS epics, designed reusable components aligned with Cisco's Magnetic Design System, and improved rendering efficiency for large datasets.</li><li><strong>Engineering with AI tools:</strong> Used repository-level coding-assistant configuration and MCP server integration to improve developer workflows. I am especially interested in well-defined tool contracts, safe boundaries, and making agent workflows useful to engineers.</li><li><strong>Microsoft TAC:</strong> Delivered product features and production fixes, improved frontend performance, integrated Playwright end-to-end tests into CI/CD, and contributed to reviews, mentoring, and engineering standards.</li><li><strong>Accessible interfaces:</strong> Built React and TypeScript interfaces using Material UI, with attention to component reuse, WCAG accessibility, testing, and performance.</li></ul>
      <h2>The details I like to explore</h2><p>I am most engaged when I can understand a problem beyond the first visible symptom. That might mean tracing state through a multi-step UI, deciding where a responsibility belongs, examining how an authentication flow behaves in an embedded browser, investigating a flaky end-to-end test, or designing an AI feature that avoids redundant calls and produces useful output.</p><p>I care about the whole path from architecture and contracts to loading states, error handling, observability, tests, and maintainability. A feature is not finished just because the happy path works on one machine.</p>
      <h2>My working principles</h2><ul><li><strong>Build foundations before adding complexity.</strong> A clear architecture makes change less expensive.</li><li><strong>Understand before optimising.</strong> Measure, trace, and test assumptions rather than guessing.</li><li><strong>Leave the system easier to work with.</strong> Reusable code, useful tests, and clear documentation help the next person.</li><li><strong>Win as a team.</strong> Share context, respect different strengths, and make the result bigger than individual credit.</li><li><strong>Keep cultivating the craft.</strong> The tools will change; curiosity and disciplined learning remain valuable.</li></ul>
      <h2>Why I write</h2><p>This website is my public notebook: a place to turn technical rabbit holes into explanations, document the reasoning behind engineering decisions, and share lessons that may help another developer. I want the writing to go beyond surface-level tips—into trade-offs, diagrams, examples, failure modes, and the details that make a solution hold up in practice.</p><p>The <strong>Must Read</strong> page is the single archive for all posts. Topics will include frontend architecture, React and TypeScript, state management, testing and browser debugging, MCP servers, AI integrations, performance, and the engineering mindset behind dependable products.</p>
      <h2>Let's connect</h2><p>If you want to discuss an engineering challenge, exchange ideas, or collaborate on something thoughtful, reach out. I'm always glad to have a good technical conversation.</p><p><strong>Email:</strong> <a href="mailto:note2anurag@outlook.com">note2anurag@outlook.com</a><br/><strong>Phone:</strong> <a href="tel:+919262748948">+91 92627 48948</a></p>
    </div></div>
    <div className="story-footer-note"><span className="status-dot"/><span>Farmer by grounding, cricketer by training, engineer by craft—and still learning.</span></div>
  </section>;
}
export default App;