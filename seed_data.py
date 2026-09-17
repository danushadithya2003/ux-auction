"""
Auction content for the "rescue a failing product" scenario.

Each item's "tier" is hidden metadata for the Admin only (never shown to
participants) - it is not a difficulty label shown in the UI, just an internal
note on what kind of card this is: a genuine advantage, something that makes
the work harder, or something that creates real difficulty or an unusual
situation. Within each category, the first 3 items are "strong", the next 3
are "harder", and the last 4 are "difficult".
"""

CATEGORIES = [
    {
        "name": "User",
        "items": [
            {"name": "User Interviews", "description": "Talk directly to real users.", "startingPrice": 20, "tier": "strong"},
            {"name": "Usability Tests", "description": "Watch users complete key tasks.", "startingPrice": 20, "tier": "strong"},
            {"name": "Session Recordings", "description": "Watch real user sessions.", "startingPrice": 10, "tier": "strong"},
            {"name": "Support Tickets", "description": "Review recent customer complaints.", "startingPrice": 10, "tier": "harder"},
            {"name": "User Survey", "description": "Survey a broad user base.", "startingPrice": 10, "tier": "harder"},
            {"name": "Power Users", "description": "Talk to your most active users.", "startingPrice": 5, "tier": "harder"},
            {"name": "Old Personas", "description": "Use personas created years ago.", "startingPrice": 5, "tier": "difficult"},
            {"name": "One Angry User", "description": "Hear one very unhappy user.", "startingPrice": 1, "tier": "difficult"},
            {"name": "CEO Feedback", "description": "Hear what the CEO thinks users want.", "startingPrice": 1, "tier": "difficult"},
            {"name": "No User Access", "description": "You cannot speak to users.", "startingPrice": 5, "tier": "difficult"},
        ],
    },
    {
        "name": "Stakeholder",
        "items": [
            {"name": "Founder Freedom", "description": "Full freedom to challenge assumptions.", "startingPrice": 20, "tier": "strong"},
            {"name": "Trusted PM", "description": "A PM who trusts your process.", "startingPrice": 20, "tier": "strong"},
            {"name": "Aligned Team", "description": "Everyone agrees on the problem.", "startingPrice": 10, "tier": "strong"},
            {"name": "Clear Success", "description": "Everyone agrees on one outcome.", "startingPrice": 10, "tier": "harder"},
            {"name": "CEO Deadline", "description": "Leadership wants results in two weeks.", "startingPrice": 10, "tier": "harder"},
            {"name": "Marketing Pressure", "description": "Marketing wants more engagement.", "startingPrice": 5, "tier": "harder"},
            {"name": "Strong Opinion", "description": "A senior stakeholder has a theory.", "startingPrice": 5, "tier": "difficult"},
            {"name": "Favourite Feature", "description": "One feature cannot be removed.", "startingPrice": 1, "tier": "difficult"},
            {"name": "Everyone Knows", "description": "The team believes it already knows the problem.", "startingPrice": 1, "tier": "difficult"},
            {"name": "Pre-Made Solution", "description": "The solution is already designed.", "startingPrice": 5, "tier": "difficult"},
        ],
    },
    {
        "name": "Product Signal",
        "items": [
            {"name": "Full Analytics", "description": "Complete product behaviour data.", "startingPrice": 20, "tier": "strong"},
            {"name": "Journey Data", "description": "See how users move through key journeys.", "startingPrice": 20, "tier": "strong"},
            {"name": "A/B Testing", "description": "Test changes against the current experience.", "startingPrice": 10, "tier": "strong"},
            {"name": "Funnel Data", "description": "See where users drop off.", "startingPrice": 10, "tier": "harder"},
            {"name": "Heatmaps", "description": "See where users click and scroll.", "startingPrice": 10, "tier": "harder"},
            {"name": "Old Data", "description": "Reliable data from six months ago.", "startingPrice": 5, "tier": "harder"},
            {"name": "Missing Events", "description": "Important product events are not tracked.", "startingPrice": 5, "tier": "difficult"},
            {"name": "One Screenshot", "description": "You get one screen from the product.", "startingPrice": 1, "tier": "difficult"},
            {"name": "Everything Looks Fine", "description": "The data shows healthy product usage.", "startingPrice": 1, "tier": "difficult"},
            {"name": "No Analytics", "description": "There is no reliable product data.", "startingPrice": 5, "tier": "difficult"},
        ],
    },
    {
        "name": "Business Constraint",
        "items": [
            {"name": "Business Data", "description": "Connect product behaviour to business results.", "startingPrice": 20, "tier": "strong"},
            {"name": "Change Anything", "description": "You can change any part of the journey.", "startingPrice": 20, "tier": "strong"},
            {"name": "One Goal", "description": "Everyone agrees on one success metric.", "startingPrice": 10, "tier": "strong"},
            {"name": "Two-Week Window", "description": "You have two weeks to make an impact.", "startingPrice": 10, "tier": "harder"},
            {"name": "Limited Engineering", "description": "Only limited development time is available.", "startingPrice": 10, "tier": "harder"},
            {"name": "Campaign Deadline", "description": "A major campaign is about to launch.", "startingPrice": 5, "tier": "harder"},
            {"name": "No Backend Changes", "description": "Backend changes are not allowed.", "startingPrice": 5, "tier": "difficult"},
            {"name": "Change Nothing", "description": "The product cannot be changed this quarter.", "startingPrice": 1, "tier": "difficult"},
            {"name": "Make It Modern", "description": "Leadership just wants a more modern product.", "startingPrice": 1, "tier": "difficult"},
            {"name": "Protect Revenue", "description": "The current revenue model cannot change.", "startingPrice": 5, "tier": "difficult"},
        ],
    },
    {
        "name": "Team & Process",
        "items": [
            {"name": "UX Researcher", "description": "A dedicated researcher joins your team.", "startingPrice": 20, "tier": "strong"},
            {"name": "Designer + Developer", "description": "A senior designer and developer work with you.", "startingPrice": 20, "tier": "strong"},
            {"name": "Data Analyst", "description": "A dedicated analyst helps find patterns.", "startingPrice": 10, "tier": "strong"},
            {"name": "Design System", "description": "An existing design system is available.", "startingPrice": 10, "tier": "harder"},
            {"name": "Engineering Week", "description": "You get one week of engineering support.", "startingPrice": 10, "tier": "harder"},
            {"name": "Designer + Developer", "description": "You have one designer and one developer.", "startingPrice": 5, "tier": "harder"},
            {"name": "Fast Prototyping", "description": "You can quickly prototype and test ideas.", "startingPrice": 5, "tier": "difficult"},
            {"name": "Only You", "description": "You handle research, design and analysis alone.", "startingPrice": 1, "tier": "difficult"},
            {"name": "Messy Figma", "description": "The existing design file is a complete mess.", "startingPrice": 1, "tier": "difficult"},
            {"name": "No Engineering", "description": "You cannot make engineering changes.", "startingPrice": 5, "tier": "difficult"},
        ],
    },
]
