
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  Heart,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { marked, Renderer } from "marked";
import mermaid from "mermaid";

type Page = "home" | "must-read" | "passions" | "story";

type Post = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const articleRenderer = new Renderer();
const defaultCodeRenderer = articleRenderer.code.bind(articleRenderer);

articleRenderer.code = (token) => {
  const language = token.lang?.trim().split(/\s+/)[0]?.toLowerCase();

  if (language === "mermaid") {
    return `<div class="mermaid">${escapeHtml(token.text)}</div>\n`;
  }

  return defaultCodeRenderer(token);
};

const postFiles = import.meta.glob("./posts/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const posts: Post[] = Object.entries(postFiles)
  .map(([path, raw]) => {
    const frontmatterMatch = raw.match(
      /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/,
    );

    const frontmatter = frontmatterMatch?.[1] ?? "";
    const meta: Record<string, string> = {};

    for (const line of frontmatter.split(/\r?\n/)) {
      const separator = line.indexOf(":");

      if (separator === -1) continue;

      const key = line.slice(0, separator).trim().toLowerCase();
      const value = line.slice(separator + 1).trim();

      if (key) {
        meta[key] = value;
      }
    }

    const content = frontmatterMatch
      ? raw.slice(frontmatterMatch[0].length)
      : raw;

    return {
      slug: path.split("/").pop()!.replace(/\.md$/, ""),
      title: meta.title ?? "Untitled post",
      date: meta.date ?? "Draft",
      category: meta.category ?? "Notes",
      excerpt: meta.excerpt ?? "",
      content,
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

const nav: { id: Page; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "must-read", label: "Must Read" },
  { id: "passions", label: "Passions" },
  { id: "story", label: "My Story" },
];

function getRoute(): { page: Page; post?: string } {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const fallbackPath = new URLSearchParams(window.location.search).get("p");

  const path = (
    fallbackPath
      ? `${base}/${fallbackPath.replace(/^\/+/, "")}`
      : window.location.pathname
  ).replace(/\/+$/, "");

  const relative = base && path.startsWith(base)
    ? path.slice(base.length)
    : path.replace(/^\/+/, "");

  const parts = relative.split("/").filter(Boolean);

  if (parts[0] === "must-read" && parts[1]) {
    return { page: "must-read", post: parts[1] };
  }

  if (parts[0] === "must-read") {
    return { page: "must-read" };
  }

  if (parts[0] === "passions") {
    return { page: "passions" };
  }

  if (parts[0] === "story") {
    return { page: "story" };
  }

  return { page: "home" };
}

function urlFor(page: Page, post?: string): string {
  const base = import.meta.env.BASE_URL;

  if (page === "home") {
    return base;
  }

  const route =
    page === "must-read"
      ? "must-read/"
      : page === "passions"
        ? "passions/"
        : "story/";

  return `${base}${route}${post ? `${post}/` : ""}`;
}

function App() {
  const [route, setRoute] = useState(getRoute);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("portfolio-theme");

    if (saved === "light" || saved === "dark") {
      return saved;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const onPop = () => setRoute(getRoute());

    window.addEventListener("popstate", onPop);

    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
  }, [route.page, route.post]);

  const navigate = (page: Page, post?: string) => {
    const url = urlFor(page, post);

    window.history.pushState({}, "", url);
    setRoute({ page, post });
  };

  const selectedPost = posts.find((post) => post.slug === route.post);

  const categories = [
    "All",
    ...Array.from(new Set(posts.map((post) => post.category))),
  ];

  const filtered = useMemo(
    () =>
      posts.filter(
        (post) =>
          (category === "All" || post.category === category) &&
          `${post.title} ${post.excerpt} ${post.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [category, query],
  );

  const openPost = (slug: string) => navigate("must-read", slug);

  return (
    <div className="site-shell">
      <header className="topbar">
        <a
          href={urlFor("home")}
          className="wordmark"
          onClick={(event) => {
            event.preventDefault();
            navigate("home");
          }}
        >
          <span className="mark">
            ag<span>.</span>
          </span>
          <span className="wordmark-label">ANURAG GAUTAM</span>
        </a>

        <nav
          className={`nav-links ${menuOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          {nav.map((item) => (
            <a
              key={item.id}
              href={urlFor(item.id)}
              className={route.page === item.id ? "active" : ""}
              aria-current={route.page === item.id ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                navigate(item.id);
              }}
            >
              {item.label}
              {item.id === "must-read" && (
                <span className="nav-count">{posts.length}</span>
              )}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="icon-button theme-toggle"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            className="icon-button menu-toggle"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main>
        {route.page === "home" && (
          <Home navigate={navigate} openPost={openPost} />
        )}

        {route.page === "must-read" &&
          (selectedPost ? (
            <Article
              post={selectedPost}
              back={() => navigate("must-read")}
              theme={theme}
            />
          ) : (
            <section className="page-section">
              <div className="eyebrow">
                <BookOpen size={14} /> THE READING ROOM
              </div>

              <h1 className="page-title">
                Must <span className="accent">Read.</span>
              </h1>

              <p className="page-intro">
                Notes from things I build, problems I investigate, and ideas
                I want to understand more deeply. This is the home for my
                technical writing.
              </p>

              <div className="post-tools">
                <label className="search-box">
                  <span className="sr-only">Search posts</span>
                  <span className="search-glyph">⌕</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search the archive…"
                  />
                </label>

                <div
                  className="category-tabs"
                  aria-label="Filter by category"
                >
                  {categories.map((item) => (
                    <button
                      key={item}
                      onClick={() => setCategory(item)}
                      className={category === item ? "selected" : ""}
                      aria-pressed={category === item}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="post-list">
                {filtered.map((post, index) => (
                  <PostRow
                    key={post.slug}
                    post={post}
                    index={index}
                    onClick={() => openPost(post.slug)}
                  />
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="empty-state">
                  No posts match that search. Try another phrase or category.
                </div>
              )}

              <p className="archive-note">
                <span className="status-dot" />
                {posts.length} {posts.length === 1 ? "piece" : "pieces"} in
                the archive
                <span className="muted"> · More writing will appear here.</span>
              </p>
            </section>
          ))}

        {route.page === "passions" && <Passions />}
        {route.page === "story" && <Story />}
      </main>

      <footer className="footer">
        <a
          href={urlFor("home")}
          onClick={(event) => {
            event.preventDefault();
            navigate("home");
          }}
          className="footer-mark"
          aria-label="Anurag Gautam, home"
        >
          ag.
        </a>

        <p>Made thoughtfully, one small detail at a time.</p>

        <div className="footer-right">
          <span>© {new Date().getFullYear()} Anurag Gautam</span>
          <a
            href="mailto:note2anurag@outlook.com"
            aria-label="Email Anurag"
          >
            <ArrowUpRight size={16} />
          </a>
        </div>
      </footer>
    </div>
  );
}

function Home({
  navigate,
  openPost,
}: {
  navigate: (page: Page) => void;
  openPost: (slug: string) => void;
}) {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" />
            SOFTWARE ENGINEER · NOIDA, INDIA
          </div>

          <h1>
            I build
            <br />
            <span className="hero-highlight">software</span>
            <br />
            by understanding
            <br />
            systems<span className="accent">.</span>
          </h1>

          <p className="hero-lede">
            I'm Anurag Gautam, a software engineer working across frontend
            architecture, enterprise applications, integrations, and
            AI-enabled workflows. I care about understanding the problem
            behind a feature, deciding where responsibilities belong, and
            building solutions that remain dependable as they evolve.
          </p>

          <div className="hero-actions">
            <button
              className="button button-primary"
              onClick={() => navigate("story")}
            >
              My engineering journey <ArrowUpRight size={16} />
            </button>

            <button
              className="button button-quiet"
              onClick={() => navigate("must-read")}
            >
              Read my writing <ArrowRight size={16} />
            </button>
          </div>

          <div className="hero-meta">
            <span>
              <Code2 size={15} /> React · TypeScript · Architecture · AI
            </span>
            <span className="meta-divider">/</span>
            <span>Curiosity beyond the first answer</span>
          </div>
        </div>

        <div
          className="hero-art"
          role="img"
          aria-label="Abstract illustration representing software architecture and connected systems"
        >
          <div className="art-grid" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-core">
            <span className="core-bracket">&lt;</span>
            <span className="core-slash">/</span>
            <span className="core-bracket">&gt;</span>
          </div>

          <div className="art-label label-top">
            <span className="tiny-square" /> DESIGN × ENGINEERING
          </div>

          <div className="art-label label-bottom">
            SYSTEMS THINKING <ArrowDownRight size={14} />
          </div>

          <span className="art-coordinate">
            REASON
            <br />
            / BUILD
            <br />
            / IMPROVE
          </span>
        </div>

        <div className="hero-index">
          <span>01</span>
          <span className="index-line" />
          <span>04</span>
        </div>
      </section>

      <section className="intro-strip">
        <span className="strip-label">HOW I THINK</span>
        <p>
          I rarely stop at making something work. I want to understand the
          conditions that make it work, the edge cases that could break it,
          the boundary where each responsibility belongs, and how the result
          can be made easier to maintain.
        </p>

        <button
          className="round-link"
          aria-label="Read my story"
          onClick={() => navigate("story")}
        >
          <ArrowUpRight size={18} />
        </button>
      </section>

      <section className="home-lower">
        <div className="section-heading">
          <div>
            <div className="eyebrow">FROM MY NOTEBOOK</div>
            <h2>
              Ideas worth your <span className="accent">time.</span>
            </h2>
          </div>

          <button
            className="text-link"
            onClick={() => navigate("must-read")}
          >
            All writing <ArrowRight size={15} />
          </button>
        </div>

        {posts.length ? (
          <div className="featured-posts">
            {posts.slice(0, 2).map((post, index) => (
              <PostRow
                key={post.slug}
                post={post}
                index={index}
                onClick={() => openPost(post.slug)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-card">
            <BookOpen size={20} />
            <div>
              <strong>The notebook is open.</strong>
              <p>
                Add a Markdown file to <code>src/posts/</code> to publish
                your first article.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="explore-grid">
        <button
          className="explore-card"
          onClick={() => navigate("passions")}
        >
          <span className="card-kicker">BEYOND THE SCREEN / 02</span>
          <span className="explore-icon">
            <Heart size={19} />
          </span>
          <strong>What matters to me</strong>
          <p>
            Cricket, technology, travel, sport, and an interest in how AI
            might help solve practical problems in agriculture.
          </p>
          <span className="card-arrow">
            <ArrowUpRight size={18} />
          </span>
        </button>

        <button
          className="explore-card"
          onClick={() => navigate("story")}
        >
          <span className="card-kicker">THE LONGER VERSION / 03</span>
          <span className="explore-icon">
            <Code2 size={19} />
          </span>
          <strong>How I got here</strong>
          <p>
            From Gangtok and competitive cricket to engineering education,
            self-taught development, and enterprise software.
          </p>
          <span className="card-arrow">
            <ArrowUpRight size={18} />
          </span>
        </button>
      </section>

      <section className="contact-section" id="contact">
        <div>
          <div className="eyebrow">LET'S CONNECT</div>
          <h2>
            Good work starts
            <br />
            with a <span className="accent">conversation.</span>
          </h2>
          <p>
            Have an interesting engineering problem, an idea worth exploring,
            or an opportunity to collaborate? I'd be glad to hear from you.
          </p>
        </div>

        <div className="contact-links">
          <a href="mailto:note2anurag@outlook.com">
            <span>Email</span>
            <strong>note2anurag@outlook.com</strong>
            <ArrowUpRight size={17} />
          </a>

          <a href="tel:+919262748948">
            <span>Phone</span>
            <strong>+91 92627 48948</strong>
            <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
    </div>
  );
}

function Article({
  post,
  back,
  theme,
}: {
  post: Post;
  back: () => void;
  theme: "light" | "dark";
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  const html = useMemo(
    () => marked.parse(post.content, { renderer: articleRenderer }) as string,
    [post.content],
  );

  useEffect(() => {
    const container = bodyRef.current;

    if (!container) return;

    container.innerHTML = html;

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: theme === "dark" ? "dark" : "default",
    });

    const diagrams = container.querySelectorAll<HTMLElement>(".mermaid");

    if (diagrams.length > 0) {
      void mermaid.run({ nodes: diagrams }).catch((error) => {
        console.error("Failed to render Mermaid diagram:", error);
      });
    }
  }, [html, theme]);

  return (
    <article className="article-page">
      <button className="back-link" onClick={back}>
        <ArrowLeft size={15} /> All writing
      </button>

      <div className="eyebrow">
        {post.category.toUpperCase()} <span className="meta-divider">/</span>{" "}
        {post.date}
      </div>

      <h1 className="article-title">{post.title}</h1>
      <p className="article-deck">{post.excerpt}</p>
      <div className="article-rule" />

      <div
        ref={bodyRef}
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="article-end">
        <span className="accent">✳</span>
        <p>Thanks for reading.</p>
        <button className="text-link" onClick={back}>
          Back to Must Read <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}

function PostRow({
  post,
  index,
  onClick,
}: {
  post: Post;
  index: number;
  onClick: () => void;
}) {
  return (
    <button className="post-row" onClick={onClick}>
      <span className="post-number">
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="post-main">
        <span className="post-category">{post.category}</span>
        <strong>{post.title}</strong>
        <span className="post-excerpt">{post.excerpt}</span>
      </span>

      <span className="post-date">{post.date}</span>

      <span className="post-arrow">
        <ArrowUpRight size={18} />
      </span>
    </button>
  );
}

function Passions() {
  const items = [
    {
      n: "01",
      title: "Cricket: a chapter that still matters",
      tag: "THE GAME",
      desc: "Cricket was a serious part of my life, not a passing hobby. I trained regularly, travelled for trials, represented at Under-16 and Under-19 levels, and played competitive cricket at different levels. It demanded discipline, patience, repetition, resilience, and the ability to keep learning after both good and difficult performances. I still follow the game and play when I can. It remains an important, unfinished chapter of my story.",
      icon: <Heart size={20} />,
    },
    {
      n: "02",
      title: "Technology: understanding the whole system",
      tag: "THE BUILDER",
      desc: "I'm interested in what happens beneath the visible interface: architecture, state and data flow, authentication, testing, browser behaviour, performance, integrations, and maintainability. I enjoy investigating why something behaves as it does, deciding which layer should own a responsibility, and improving the system rather than patching only the first symptom.",
      icon: <Code2 size={20} />,
    },
    {
      n: "03",
      title: "Agriculture: practical problems worth exploring",
      tag: "A FUTURE INTEREST",
      desc: "My family background keeps agriculture close to my interests. I'm curious about how intelligence could help with practical agricultural problems, particularly grain-quality assessment. This is an area I'd like to explore through research and experimentation, not a claim that I currently work as a farmer or have already built an agricultural AI product.",
      icon: <ArrowUpRight size={20} />,
    },
    {
      n: "04",
      title: "Travel, sport, and discovery",
      tag: "THE EXPLORER",
      desc: "Travel and sport give me a life beyond a screen. Different places, people, and experiences help challenge assumptions and broaden perspective. I value curiosity that isn't limited to a job title, a technology stack, or a formal learning plan.",
      icon: <BookOpen size={20} />,
    },
    {
      n: "05",
      title: "Technical learning and clear explanations",
      tag: "THE NOTE-TAKER",
      desc: "I enjoy going deeper than the quick fix: following a problem through the system, comparing possible solutions, understanding trade-offs, and documenting what I learn. This website is a place for technical writing when I have something useful to explain, from engineering decisions and debugging to AI integrations and dependable software.",
      icon: <BookOpen size={20} />,
    },
  ];

  return (
    <section className="page-section passions-page">
      <div className="eyebrow">
        <Heart size={14} /> THE THINGS THAT MATTER TO ME
      </div>

      <h1 className="page-title">
        More than <span className="accent">a job title.</span>
      </h1>

      <p className="page-intro">
        Some interests shape how I work. Others matter simply because they
        are part of who I am. I don't need to turn every passion into a
        professional metaphor for it to belong in my story.
      </p>

      <div className="story-callout">
        <span className="quote-mark">“</span>
        <p>
          Stay curious about the problem.
          <br />
          Respect the work it takes to improve.
          <br />
          Keep room for the things that matter.
        </p>
        <span className="quote-credit">
          A few principles I try to carry through different parts of life.
        </span>
      </div>

      <div className="passion-list">
        {items.map((item) => (
          <div className="passion-row" key={item.n}>
            <span className="passion-num">{item.n}</span>
            <div className="passion-icon">{item.icon}</div>

            <div className="passion-copy">
              <span className="post-category">{item.tag}</span>
              <h2>{item.title}</h2>
              <p>{item.desc}</p>
            </div>

            <span className="passion-star">✳</span>
          </div>
        ))}
      </div>

      <p className="editable-note">
        These interests are part of a wider life, not a checklist of
        professional achievements.
      </p>
    </section>
  );
}

function Story() {
  return (
    <section className="page-section story-page">
      <div className="eyebrow">
        <Code2 size={14} /> THE PERSON BEHIND THE ENGINEERING
      </div>

      <h1 className="page-title">
        The path that <span className="accent">shaped me.</span>
      </h1>

      <p className="page-intro">
        My journey into software wasn't a straight line. It passed through
        family responsibilities, engineering education, a serious pursuit
        of cricket, and the challenge of teaching myself a new craft. Each
        chapter changed how I look at problems and decisions.
      </p>

      <div className="story-callout">
        <span className="quote-mark">“</span>
        <p>
          I want to understand the problem well enough to make the solution
          better, not merely make the first version work.
        </p>
        <span className="quote-credit">
          The question that continues to shape my engineering approach.
        </span>
      </div>

      <div className="story-content">
        <div className="story-aside">
          <span className="post-category">CURRENT CHAPTER</span>
          <strong>Engineering with intent</strong>
          <span className="aside-line" />
          <span className="muted">Noida, India</span>
          <a className="text-link" href="mailto:note2anurag@outlook.com">
            Get in touch <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="story-body">
          <h2>Where I started</h2>
          <p>
            I grew up in a middle-class family with roots in Bihar. My
            parents moved from Bihar to Sikkim in search of a livelihood,
            and I completed my schooling in Gangtok. Education mattered to
            me, and I was naturally competitive, curious, and ambitious.
          </p>
          <p>
            As a child, I wanted to become successful enough to give my
            mother the things I felt she deserved. That ambition was
            personal. It was tied to seeing what my parents worked through,
            understanding the limits they had to manage, and wanting to
            build a different set of possibilities for my family.
          </p>

          <h2>Cricket was a serious pursuit</h2>
          <p>
            Cricket was one of the most important parts of my early life.
            After school, I pursued the game seriously, trained regularly
            with a club in Patna, and travelled for trials in Sikkim. I
            represented at Under-16 and Under-19 levels and played
            competitive cricket at different levels.
          </p>
          <p>
            Cricket was not simply something I did after studying. It was
            something I loved deeply and wanted to pursue. Some relatives
            assumed I was neglecting my studies, while I was trying to make
            room for both. My father also encouraged me to sit for
            engineering entrance examinations. I worked hard and earned
            admission to NIT Sikkim, where I studied from 2012 to 2016.
          </p>
          <p>
            My education exposed me to different people, personalities,
            and ways of approaching problems. It strengthened my belief in
            examining the facts, thinking independently, standing by what
            I believe is right, and being thoughtful about whom I trust.
          </p>

          <h2>A difficult decision, not a neat ending</h2>
          <p>
            Even after engineering college, I continued trying to make
            cricket work. I went to Kolkata and took a regular job in travel
            operations to cover my expenses rather than depend entirely on
            my parents. An injury kept me away from playing for months.
          </p>
          <p>
            Around 2018, I had to think seriously about my parents getting
            older, the responsibilities ahead, and the uncertainty of
            continuing on that path. I chose to reconsider my direction.
            That decision was shaped by circumstances and family
            responsibilities, not by cricket becoming unimportant.
          </p>
          <p>
            Cricket remains an incomplete chapter in the sense that I still
            care about the game. I continue to follow it and play when I
            can. I don't need to describe that part of my life as a finished
            professional career to acknowledge how much it meant to me.
          </p>

          <h2>Learning to build software</h2>
          <p>
            Friends working in IT encouraged me to give software
            development a serious try. They thought my analytical approach
            could suit the work. I joined a small startup and began learning
            to code on my own, starting with free Codecademy lessons. At
            first, even the syntax felt unfamiliar. I kept practising until
            the pieces began to make sense.
          </p>
          <p>
            My first IT role was as a frontend engineer. Since then, I have
            grown through software roles involving enterprise applications
            and work across Cisco and Microsoft projects, along with earlier
            experience at Magic EdTech, Rapidsoft Technologies, and Amocabs.
            What began as learning to implement interfaces has developed
            into a broader interest in how applications and systems should
            be designed, integrated, tested, and maintained.
          </p>

          <h2>What I work on today</h2>
          <p>
            My strongest foundation is frontend and application engineering,
            particularly React, TypeScript, complex UI state, reusable
            architecture, and production-facing web applications. But I
            don't think of the job as simply putting pixels on a screen.
            A user interface is connected to data, authentication,
            asynchronous workflows, business rules, browser behaviour, and
            the services behind it. Those connections deserve as much care
            as the visible result.
          </p>
          <ul>
            <li>
              <strong>Application architecture:</strong> Making clear
              boundaries between application surfaces, shared logic, and
              responsibilities so features remain easier to evolve.
            </li>
            <li>
              <strong>Enterprise workflows:</strong> Working with complex
              state, reusable components, design systems, performance, and
              the behaviour of large data-driven interfaces.
            </li>
            <li>
              <strong>AI-enabled experiences:</strong> Contributing to
              AI-summary workflows and thinking about how generated
              narratives should interact with authoritative domain data.
            </li>
            <li>
              <strong>MCP and agent integrations:</strong> Working on
              canonical tool contracts, tool boundaries, authentication
              considerations, and making application capabilities available
              through structured interfaces.
            </li>
            <li>
              <strong>Reliability and testing:</strong> Investigating
              browser-specific issues, authentication flows, end-to-end
              tests, production failures, and the edge cases that appear
              outside the happy path.
            </li>
          </ul>

          <h2>The questions I naturally ask</h2>
          <p>
            I tend to keep asking questions after the first implementation
            works. Why does this behaviour occur? Which layer should own
            this rule? What happens when the timezone changes, a request
            repeats, a session expires, or an embedded browser behaves
            differently? Can the model generate a useful explanation
            without becoming the authority for business data?
          </p>
          <p>
            I enjoy tracing these questions through the available evidence,
            understanding the trade-offs, and finding a solution that
            addresses the actual problem. For me, engineering includes the
            less visible work: boundaries, failure states, observability,
            tests, maintainability, and the effect a change will have on
            the rest of the system.
          </p>

          <h2>Where I want to grow</h2>
          <p>
            I want to keep expanding from application engineering into
            broader solution design, especially applied AI. I'm interested
            in how models, tools, existing software, and reliable domain
            logic can work together to solve practical problems. I am also
            curious about possible applications in agriculture, including
            grain-quality assessment. These are directions I want to
            explore and validate through real work, rather than expertise
            I claim to have already established.
          </p>

          <h2>How I try to work</h2>
          <ul>
            <li>
              <strong>Understand before changing.</strong> Follow evidence
              and examine assumptions instead of fixing only the symptom.
            </li>
            <li>
              <strong>Choose boundaries deliberately.</strong> Put each
              responsibility where it can be understood, tested, and
              maintained.
            </li>
            <li>
              <strong>Respect the edge cases.</strong> A feature is not
              complete just because the happy path works.
            </li>
            <li>
              <strong>Keep learning the craft.</strong> Tools change;
              curiosity and disciplined practice continue to matter.
            </li>
            <li>
              <strong>Take the team seriously.</strong> Share context,
              learn from different perspectives, and care about the
              collective result.
            </li>
          </ul>

          <h2>Why I write</h2>
          <p>
            This site is a public notebook for the things I learn and
            investigate. I want to explain engineering decisions, technical
            trade-offs, debugging approaches, and ideas that deserve more
            than a quick answer. The aim is not to publish for the sake of
            publishing; it is to create something useful when I have a
            lesson or explanation worth sharing.
          </p>
          <p>
            The <strong>Must Read</strong> page is the single archive for
            my writing. Topics can include frontend architecture, React and
            TypeScript, testing, browser debugging, MCP integrations, AI
            workflows, and dependable software.
          </p>

          <h2>Let's connect</h2>
          <p>
            If you want to discuss an engineering problem, exchange ideas,
            or explore a thoughtful collaboration, feel free to reach out.
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:note2anurag@outlook.com">
              note2anurag@outlook.com
            </a>
            <br />
            <strong>Phone:</strong>{" "}
            <a href="tel:+919262748948">+91 92627 48948</a>
          </p>
        </div>
      </div>

      <div className="story-footer-note">
        <span className="status-dot" />
        <span>
          Still curious. Still learning. Interested in solving problems that
          matter.
        </span>
      </div>
    </section>
  );
}

export default App;
