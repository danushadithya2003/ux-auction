const STEPS = [
  {
    title: "The scenario",
    body: "A product launched about a year ago is technically fine but failing anyway. You're on the team investigating why — and you'll only have some of the picture.",
  },
  {
    title: "Your budget",
    body: "Everyone starts with 100 coins. Spend them at auction to acquire cards across 5 categories: User, Stakeholder, Product Signal, Business Constraint, and Team & Process.",
  },
  {
    title: "The one rule that matters",
    body: "You need at least one item from every category. The system reserves enough of your budget automatically so you can never accidentally spend yourself out of a category.",
  },
  {
    title: "Bidding",
    body: "Each item gets a 15-second window that resets every time someone bids. When it goes quiet, the Auctioneer confirms the sale — or the item goes unsold and may come back later.",
  },
  {
    title: "The point of it all",
    body: "Everyone ends up with a different, incomplete hand of cards. That's intentional — the real exercise starts after the auction, comparing what each of you knows and doesn't.",
  },
];

export default function HowItWorks() {
  const left = STEPS.slice(0, 3);
  const right = STEPS.slice(3);

  return (
    <div>
      <h2 style={{ fontSize: 44, marginBottom: 4 }}>How It Works</h2>
      <p className="muted" style={{ marginBottom: 26 }}>The short version of the rules — the facilitator will cover the full scenario live.</p>

      <div className="how-shell">
        <div className="how-col">
          {left.map((s, i) => (
            <div className="how-rule" key={s.title}>
              <div className="how-numeral">{i + 1}</div>
              <div>
                <div className="how-rule-title">{s.title}</div>
                <p className="how-rule-body">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="how-col">
          {right.map((s, i) => (
            <div className="how-rule" key={s.title}>
              <div className="how-numeral how-numeral-cyan">{i + 4}</div>
              <div>
                <div className="how-rule-title">{s.title}</div>
                <p className="how-rule-body">{s.body}</p>
              </div>
            </div>
          ))}
          <div className="house-motto">
            <div className="house-motto-label">HOUSE MOTTO</div>
            <div className="house-motto-text">
              Different resources.<br />
              New perspectives.<br />
              A better solution.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
