import Link from "next/link";

export default function HomePage() {
  return (
    <div className="wrap">
      <div className="hero">
        <p className="letter-kicker">For someone you love</p>
        <h1>A letter they can open.</h1>
        <p>
          Write sentences on a timeline. They type out, pictures arrive with the words, and a heart on the envelope
          starts it. Share one link.
        </p>
        <div className="row">
          <Link className="btn rose" href="/create">
            Write a letter
          </Link>
          <Link className="btn ghost" href="/v/demo">
            Watch the demo
          </Link>
        </div>
      </div>
    </div>
  );
}
