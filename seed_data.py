"""
Auction content for the "rescue a failing product" scenario.

Each item's "tier" is hidden metadata for the Admin only (never shown to
participants) - it is not a difficulty label shown in the UI, just an internal
note on what kind of card this is: a genuine advantage, something that makes
the work harder, or something that creates real difficulty or an unusual
situation.
"""

CATEGORIES = [
    {
        "name": "User",
        "items": [
            {"name": "Verbatim Interview Transcripts", "description": "Eight hour-long interviews with people who actually use the product weekly, unedited.", "startingPrice": 24, "tier": "strong"},
            {"name": "Full-Funnel Behavioral Analytics", "description": "Every click, drop-off, and rage-tap for the last two quarters, correctly instrumented.", "startingPrice": 22, "tier": "strong"},
            {"name": "A Standing Panel of Power Users", "description": "Five engaged users who've agreed to test anything you ship and tell you the truth.", "startingPrice": 19, "tier": "strong"},
            {"name": "Two Segments, Two Opposite Asks", "description": "Your heaviest users want simplicity. Your newest users want more guidance. Same screen.", "startingPrice": 15, "tier": "harder"},
            {"name": "Feedback From the Loudest 2%", "description": "Every review and ticket comes from the same handful of vocal users. Everyone else stays silent.", "startingPrice": 11, "tier": "harder"},
            {"name": "Personas From Three Years Ago", "description": "Built once, never revisited, and nobody left on the team remembers who they were based on.", "startingPrice": 8, "tier": "harder"},
            {"name": "One User With the CEO's Phone Number", "description": "Their complaints get forwarded to you as \"urgent,\" regardless of how representative they are.", "startingPrice": 9, "tier": "difficult"},
            {"name": "The Users You Built This For Already Left", "description": "Your original target audience quietly migrated to a competitor last year.", "startingPrice": 7, "tier": "difficult"},
            {"name": "An Accessibility Complaint, Open Six Months", "description": "Filed by a real user. Still unassigned. Still unresolved.", "startingPrice": 6, "tier": "difficult"},
            {"name": "A Burned Research Relationship", "description": "Your best potential participant agreed to an interview once, felt misled by the outcome, and won't reply anymore.", "startingPrice": 6, "tier": "difficult"},
        ],
    },
    {
        "name": "Stakeholder",
        "items": [
            {"name": "A Sponsor Who Actually Has Your Back", "description": "Senior enough to absorb political noise, and willing to spend that capital on you.", "startingPrice": 23, "tier": "strong"},
            {"name": "One Clear, Written Success Metric", "description": "Leadership actually agreed on what \"fixed\" means, in writing, before you started.", "startingPrice": 21, "tier": "strong"},
            {"name": "A Direct Line to the Real Decision-Maker", "description": "No proxy, no filtering, no guessing what they actually meant.", "startingPrice": 25, "tier": "strong"},
            {"name": "A Deadline Set Before Anyone Understood the Problem", "description": "Two weeks to show a \"visible turnaround,\" starting now.", "startingPrice": 14, "tier": "harder"},
            {"name": "Two VPs, Two Different Mandates", "description": "Both are convinced they already told you exactly what to build.", "startingPrice": 16, "tier": "harder"},
            {"name": "A Frozen Budget, Mid-Investigation", "description": "Whatever you were about to fund, you can't anymore - effective immediately.", "startingPrice": 10, "tier": "harder"},
            {"name": "The Approver Who's Never in the Room", "description": "Every decision waits on someone who's perpetually \"just about to\" get back to you.", "startingPrice": 8, "tier": "difficult"},
            {"name": "A Promise Already Made to a Big Client", "description": "Sales committed to a specific feature before anyone checked whether it made sense.", "startingPrice": 9, "tier": "difficult"},
            {"name": "A Champion Who's Gone Quiet", "description": "The exec who originally backed this work has stopped responding to updates entirely.", "startingPrice": 6, "tier": "difficult"},
            {"name": "Two Departments, One Roadmap, No Peace Treaty", "description": "You've just inherited a turf war you didn't start and can't fully see.", "startingPrice": 7, "tier": "difficult"},
        ],
    },
    {
        "name": "Product Signal",
        "items": [
            {"name": "Instrumented, Trustworthy Funnel Data", "description": "Every step tracked correctly. No gaps, no guesswork, no asterisks.", "startingPrice": 22, "tier": "strong"},
            {"name": "A Clear Pattern in Support Tickets", "description": "Six months of complaints, already grouped into real, actionable themes.", "startingPrice": 18, "tier": "strong"},
            {"name": "Working Experimentation Infrastructure", "description": "You can ship a real A/B test this week, not next quarter.", "startingPrice": 20, "tier": "strong"},
            {"name": "Heatmaps, and Only Heatmaps", "description": "You can see exactly where people clicked. You have no idea why.", "startingPrice": 12, "tier": "harder"},
            {"name": "A Dashboard Everyone Watches That Means Nothing", "description": "The number on the wall every Monday doesn't track what actually matters.", "startingPrice": 9, "tier": "harder"},
            {"name": "A Tracking Event That Broke Three Months Ago", "description": "Nobody noticed until just now. Nobody knows what else it affected.", "startingPrice": 11, "tier": "harder"},
            {"name": "Two Teams, Two Sets of Numbers, No Agreement", "description": "Same product, same time period, incompatible dashboards.", "startingPrice": 7, "tier": "difficult"},
            {"name": "One Unexplained Spike Everyone Already Calls a Win", "description": "Nobody investigated it. Everyone in leadership cites it anyway.", "startingPrice": 8, "tier": "difficult"},
            {"name": "Data That Quietly Excludes Your Actual Users", "description": "The segment you need was filtered out upstream, months before you got here.", "startingPrice": 6, "tier": "difficult"},
            {"name": "No Error Logging in Production", "description": "You genuinely don't know what's breaking, for whom, or how often.", "startingPrice": 6, "tier": "difficult"},
        ],
    },
    {
        "name": "Business Constraint",
        "items": [
            {"name": "A Timeline That Isn't a Trap", "description": "Leadership agreed to a schedule based on the actual scope of the work.", "startingPrice": 21, "tier": "strong"},
            {"name": "A Small Team, Fully Dedicated", "description": "No context-switching, no borrowed time, no \"when they get a chance.\"", "startingPrice": 23, "tier": "strong"},
            {"name": "A Success Metric Tied to Real Revenue", "description": "What you're optimizing for is something the business actually feels.", "startingPrice": 19, "tier": "strong"},
            {"name": "Engineers Shared Across Three Other Fires", "description": "Technically staffed on paper. Practically unavailable most weeks.", "startingPrice": 13, "tier": "harder"},
            {"name": "A Compliance Requirement That Just Landed", "description": "New rules on what you're allowed to change, and how fast you're allowed to change it.", "startingPrice": 12, "tier": "harder"},
            {"name": "A Launch Date Marketing Already Announced", "description": "Set publicly, without asking anyone who's actually building the thing.", "startingPrice": 10, "tier": "harder"},
            {"name": "An Eighteen-Month Vendor Lock-In", "description": "The broken piece of the stack you'd replace first is contractually untouchable.", "startingPrice": 8, "tier": "difficult"},
            {"name": "Use-It-or-Lose-It Budget", "description": "The money is real, and gone in ten weeks if it isn't spent.", "startingPrice": 7, "tier": "difficult"},
            {"name": "A Feature Nobody Uses That Nobody Will Kill", "description": "Too expensive to have built to just quietly let go of now.", "startingPrice": 6, "tier": "difficult"},
            {"name": "An Unannounced Merger Freezing Every Decision", "description": "Nobody will commit to a roadmap right now, for reasons they can't say yet.", "startingPrice": 6, "tier": "difficult"},
        ],
    },
    {
        "name": "Team & Process",
        "items": [
            {"name": "A Cross-Functional Team That Already Trusts Each Other", "description": "Design, product, and engineering, already in sync before you showed up.", "startingPrice": 22, "tier": "strong"},
            {"name": "A Lightweight Research Habit Already in Place", "description": "Talking to users isn't a special event here. It's just how the team works.", "startingPrice": 17, "tier": "strong"},
            {"name": "Engineering That Ships Your Recommendations Fast", "description": "Your input turns into shipped work in days, not a backlog debate that never resolves.", "startingPrice": 20, "tier": "strong"},
            {"name": "No Design System, Anywhere", "description": "Every screen is its own decision, made from scratch, by whoever built it.", "startingPrice": 11, "tier": "harder"},
            {"name": "Years of UX Debt, Owned by No One", "description": "Everyone agrees it's a problem. It is nobody's actual job to fix it.", "startingPrice": 10, "tier": "harder"},
            {"name": "Half the Team This Problem Actually Needs", "description": "Resourced and scoped for a simpler version of the job than the one in front of you.", "startingPrice": 13, "tier": "harder"},
            {"name": "The One Engineer Who Understood the Legacy System Just Quit", "description": "Along with most of the institutional memory that went with them.", "startingPrice": 8, "tier": "difficult"},
            {"name": "A Quiet Turf War Over Who Owns This Roadmap", "description": "Two teams, one product, no agreement on who actually decides.", "startingPrice": 7, "tier": "difficult"},
            {"name": "No Shared Definition of \"Done\"", "description": "Every team means something different when they say a thing is finished.", "startingPrice": 6, "tier": "difficult"},
            {"name": "Zero Documentation, Anywhere", "description": "How the system actually works lives in people's heads - and only some of them are still here.", "startingPrice": 6, "tier": "difficult"},
        ],
    },
]
