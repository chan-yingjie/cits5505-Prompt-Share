window.promptFeedData = [
    {
        id: "article-summary",
        title: "Summarise an article into sharp takeaways",
        category: "Writing",
        categorySlug: "writing",
        subcategory: "Summarisation",
        subcategorySlug: "summarisation",
        author: "Armin312",
        authorHandle: "@Armin312",
        authorBio: "Focuses on concise summarisation prompts for news, policy, and long-form reading tasks.",
        authorLink: "../profile.html?user=Armin312",
        submittedAt: "2026-04-10T09:30:00+08:00",
        keywords: ["summarisation", "news", "bullet points"],
        prompt: "Summarise the following news article in exactly three bullet points. Each bullet must cover one of these: what happened, why it happened, and what happens next. Keep each bullet under 18 words.",
        summary: "A structured summarisation prompt that keeps long articles readable without losing the event, cause, and consequence, while also forcing the response to stay compact, scannable, and useful for fast review in study or news-heavy workflows.",
        outputPreview: "The response compresses a long article into three short, scannable bullets with clear cause-and-effect framing.",
        outputFull: [
            "What happened: The council approved a rapid housing proposal after months of stalled negotiations.",
            "Why it happened: Rising rent pressure and public criticism forced the policy vote forward.",
            "What happens next: Construction begins in July, with progress reviews scheduled every quarter."
        ],
        likes: 42,
        viewCount: 186,
        copyCount: 24,
        shareCount: 9,
        favorites: 11,
        liked: false,
        favorited: true,
        votes: 15,
        comments: [
            {
                author: "chinmaiii",
                handle: "@chinmaiii",
                body: "The instruction is strict enough to control output length without making the model brittle."
            },
            {
                author: "chan-yingjie",
                handle: "@chan-yingjie",
                body: "I would reuse this for reading-heavy units because the bullet constraints are clear."
            },
            {
                author: "demo_user",
                handle: "@demo_user",
                body: "Good balance between structure and flexibility. The \"what happens next\" angle is useful."
            }
        ]
    },
    {
        id: "email-rewrite",
        title: "Rewrite an email for a professional escalation",
        category: "Writing",
        categorySlug: "writing",
        subcategory: "Email",
        subcategorySlug: "email",
        author: "chinmaiii",
        authorHandle: "@chinmaiii",
        authorBio: "Builds workplace communication prompts with a strong focus on tone control and clarity.",
        authorLink: "../profile.html?user=chinmaiii",
        submittedAt: "2026-04-11T14:20:00+08:00",
        keywords: ["email", "professional tone", "workplace"],
        prompt: "Rewrite this email in a professional, calm, and assertive tone. Preserve the original request, remove emotional language, and end with a direct next-step question.",
        summary: "Designed for users who need a stronger email without sounding hostile or vague, especially when they need to preserve professionalism, make the next step clear, and reduce the chance of the message sounding emotional or unfocused.",
        outputPreview: "The result keeps the user intent intact while replacing frustration with precise, business-safe language.",
        outputFull: [
            "Hello team,",
            "I am following up on the unresolved access issue reported earlier this week.",
            "Could you confirm the expected resolution timeline and advise whether any further information is needed from my side?"
        ],
        likes: 27,
        viewCount: 131,
        copyCount: 18,
        shareCount: 6,
        favorites: 8,
        liked: true,
        favorited: false,
        votes: 10,
        comments: [
            {
                author: "Armin312",
                handle: "@Armin312",
                body: "This is practical because it preserves the ask and adds a clear closing action."
            },
            {
                author: "mia.codes",
                handle: "@mia.codes",
                body: "The tone is consistent. Adding role context could make it even stronger for workplace use."
            }
        ]
    },
    {
        id: "study-questions",
        title: "Generate revision questions from lecture notes",
        category: "Education",
        categorySlug: "education",
        subcategory: "Revision",
        subcategorySlug: "revision",
        author: "chan-yingjie",
        authorHandle: "@chan-yingjie",
        authorBio: "Creates study-oriented prompts for revision, practice questions, and structured learning support.",
        authorLink: "../profile.html?user=chan-yingjie",
        submittedAt: "2026-04-13T19:05:00+08:00",
        keywords: ["study", "revision", "lecture notes"],
        prompt: "Create five revision questions from the lecture summary below. Include two short-answer questions, two applied scenario questions, and one discussion question.",
        summary: "Turns passive notes into revision material with a deliberate spread of question types, helping students move from reading mode into active recall, applied practice, and discussion-based thinking without rebuilding the study set manually.",
        outputPreview: "The model produces a mixed question set suitable for self-testing before tutorials or exams.",
        outputFull: [
            "1. What are the two primary goals of version control in collaborative software development?",
            "2. Explain the difference between staging changes and committing them.",
            "3. A teammate overwrites shared work in the main branch. What Git workflow issue likely caused this?",
            "4. Your project has conflicting edits in one file. How would you approach the merge resolution?",
            "5. Why do branching strategies affect both team speed and software reliability?"
        ],
        likes: 53,
        viewCount: 244,
        copyCount: 37,
        shareCount: 14,
        favorites: 19,
        liked: false,
        favorited: false,
        votes: 18,
        comments: [
            {
                author: "leo.study",
                handle: "@leo.study",
                body: "The scenario questions make this much more useful than a generic quiz generator."
            },
            {
                author: "chinmaiii",
                handle: "@chinmaiii",
                body: "This would work well with textbook chapters too, not just lecture notes."
            },
            {
                author: "Armin312",
                handle: "@Armin312",
                body: "Good prompt engineering choice to specify the distribution of question types."
            },
            {
                author: "noa",
                handle: "@noa",
                body: "Visible output is strong. I can tell what kind of study experience the prompt creates."
            }
        ]
    },
    {
        id: "video-hook-board",
        title: "Generate short video hooks for social content",
        category: "Video",
        categorySlug: "video",
        subcategory: "Short Video",
        subcategorySlug: "short-video",
        author: "mia.codes",
        authorHandle: "@mia.codes",
        authorBio: "Designs prompt workflows for social video concepts, scripts, and audience retention.",
        authorLink: "../profile.html?user=mia.codes",
        submittedAt: "2026-04-14T11:15:00+08:00",
        keywords: ["video", "hooks", "social media"],
        prompt: "Create six opening hooks for a 30-second explainer video about this topic. Each hook must feel fast, visual, and suitable for captions in the first three seconds.",
        summary: "Useful for creators who need multiple opening lines before writing a full short-form video script, giving them several retention-focused directions to test before they commit to a final storyboard, caption strategy, or pacing style.",
        outputPreview: "The output produces punchy first-line options designed to improve watch retention on short video platforms.",
        outputFull: [
            "Nobody tells students this before their first group project.",
            "This one Git habit saves hours every single week.",
            "If your repo feels messy, start with this rule."
        ],
        likes: 31,
        viewCount: 142,
        copyCount: 16,
        shareCount: 7,
        favorites: 9,
        liked: false,
        favorited: false,
        votes: 12,
        comments: [
            {
                author: "chinmaiii",
                handle: "@chinmaiii",
                body: "The constraint around the first three seconds makes the output much more usable."
            }
        ]
    },
    {
        id: "image-product-scene",
        title: "Create product image prompts with a clean studio look",
        category: "Image",
        categorySlug: "image",
        subcategory: "Product Photography",
        subcategorySlug: "product-photography",
        author: "leo.study",
        authorHandle: "@leo.study",
        authorBio: "Focuses on visual prompt patterns for product shots, posters, and campaign concepts.",
        authorLink: "../profile.html?user=leo.study",
        submittedAt: "2026-04-14T16:40:00+08:00",
        keywords: ["image", "product", "lighting"],
        prompt: "Write an image-generation prompt for a minimalist product hero shot. Include lighting direction, lens feel, surface material, and one accent colour. Keep the description under 70 words.",
        summary: "A compact image prompt template for crisp product renders with more control over mood and styling, making it easier to keep lighting, material feel, composition, and brand tone consistent across multiple generated visuals.",
        outputPreview: "The model returns a polished product-shot prompt with lighting, texture, and composition details already structured.",
        outputFull: [
            "Minimalist studio hero shot of a matte black wireless headset on brushed aluminium.",
            "Soft side lighting from camera left, shallow depth of field, 85mm lens feel.",
            "Warm amber accent reflected subtly across the base surface."
        ],
        likes: 38,
        viewCount: 173,
        copyCount: 22,
        shareCount: 8,
        favorites: 12,
        liked: true,
        favorited: true,
        votes: 13,
        comments: [
            {
                author: "Armin312",
                handle: "@Armin312",
                body: "Nice balance between creative control and brevity."
            },
            {
                author: "mia.codes",
                handle: "@mia.codes",
                body: "This would scale well for ecommerce teams."
            }
        ]
    },
    {
        id: "education-language-drill",
        title: "Build a daily language practice drill",
        category: "Education",
        categorySlug: "education",
        subcategory: "Language Learning",
        subcategorySlug: "language-learning",
        author: "noa",
        authorHandle: "@noa",
        authorBio: "Creates structured education prompts for self-study, repetition, and guided practice.",
        authorLink: "../profile.html?user=noa",
        submittedAt: "2026-04-15T08:10:00+08:00",
        keywords: ["education", "language", "practice"],
        prompt: "Act as a daily language tutor. Give me one short dialogue, three vocabulary items, one grammar correction, and one speaking challenge based on my target level.",
        summary: "A repeatable study prompt for lightweight language practice with vocabulary, correction, and speaking output in one flow, so learners can keep a steady daily routine without needing to design a new exercise structure every time.",
        outputPreview: "The response feels like a compact daily lesson rather than a generic explanation.",
        outputFull: [
            "Dialogue: A short conversation about ordering coffee on campus.",
            "Vocabulary: receipt, oat milk, crowded.",
            "Speaking challenge: Describe your usual morning order in two sentences."
        ],
        likes: 24,
        viewCount: 119,
        copyCount: 12,
        shareCount: 4,
        favorites: 7,
        liked: false,
        favorited: false,
        votes: 9,
        comments: [
            {
                author: "chan-yingjie",
                handle: "@chan-yingjie",
                body: "This is a strong example of an education prompt with a very clear routine."
            }
        ]
    },
    {
        id: "coding-bug-debugger",
        title: "Turn an error log into a debugging plan",
        category: "Coding",
        categorySlug: "coding",
        subcategory: "Debugging",
        subcategorySlug: "debugging",
        author: "kai.dev",
        authorHandle: "@kai.dev",
        authorBio: "Shares coding prompts focused on debugging, refactoring, and development workflows.",
        authorLink: "../profile.html?user=kai.dev",
        submittedAt: "2026-04-15T09:45:00+08:00",
        keywords: ["coding", "debugging", "error logs"],
        prompt: "Read this stack trace and produce a debugging plan with likely root causes, the first three checks to run, and one safe fix path.",
        summary: "Turns scattered error details into a practical debugging sequence that helps teams locate issues faster, reducing guesswork by turning raw logs and stack traces into a prioritized plan with checks, likely causes, and safer fix options.",
        outputPreview: "The output prioritises probable causes, quick verification steps, and a lower-risk fix direction.",
        outputFull: [
            "Likely root cause: a null API response is being accessed before validation.",
            "First checks: inspect the failing response payload, confirm the async timing, and log the undefined branch.",
            "Safe fix path: add a guard clause and fallback UI before reading nested values."
        ],
        likes: 46,
        viewCount: 201,
        copyCount: 29,
        shareCount: 11,
        favorites: 15,
        liked: true,
        favorited: false,
        votes: 17,
        comments: [
            {
                author: "mia.codes",
                handle: "@mia.codes",
                body: "Useful because it converts panic debugging into a sequence."
            },
            {
                author: "Armin312",
                handle: "@Armin312",
                body: "The safe-fix constraint helps avoid reckless changes."
            }
        ]
    },
    {
        id: "marketing-launch-campaign",
        title: "Generate a three-phase product launch campaign",
        category: "Marketing",
        categorySlug: "marketing",
        subcategory: "Campaign",
        subcategorySlug: "campaign",
        author: "luna.market",
        authorHandle: "@luna.market",
        authorBio: "Creates campaign prompts for product storytelling, launch messaging, and audience targeting.",
        authorLink: "../profile.html?user=luna.market",
        submittedAt: "2026-04-15T10:30:00+08:00",
        keywords: ["marketing", "campaign", "launch"],
        prompt: "Plan a three-phase product launch campaign for this feature. Break it into pre-launch, launch day, and follow-up. Include audience, channel, key message, and CTA for each phase.",
        summary: "Generates a full campaign structure in one prompt so teams can move from planning into execution quickly, giving them an organized phase-by-phase outline that is easier to review, adapt, and turn into actual channel deliverables.",
        outputPreview: "The model returns a structured campaign outline with message sequencing and CTA alignment.",
        outputFull: [
            "Pre-launch: tease the user pain point with short-form social posts and email waitlist CTA.",
            "Launch day: show the product value with demo clips, homepage hero copy, and direct signup CTA.",
            "Follow-up: publish a proof-driven case study and retarget visitors who viewed the feature page."
        ],
        likes: 35,
        viewCount: 154,
        copyCount: 20,
        shareCount: 9,
        favorites: 10,
        liked: false,
        favorited: true,
        votes: 14,
        comments: [
            {
                author: "chinmaiii",
                handle: "@chinmaiii",
                body: "The phase split makes the output ready for stakeholder review."
            }
        ]
    },
    {
        id: "productivity-slide-outline",
        title: "Create a concise slide outline for a team update",
        category: "Productivity",
        categorySlug: "productivity",
        subcategory: "Presentation",
        subcategorySlug: "presentation",
        author: "ivy.ops",
        authorHandle: "@ivy.ops",
        authorBio: "Builds productivity prompts for meetings, summaries, and structured office communication.",
        authorLink: "../profile.html?user=ivy.ops",
        submittedAt: "2026-04-15T12:05:00+08:00",
        keywords: ["productivity", "slides", "team update"],
        prompt: "Turn these project notes into a 6-slide team update deck outline. Each slide should have one headline, two supporting bullets, and one recommended visual.",
        summary: "Helps users turn scattered project notes into a presentation-ready structure for weekly updates and reviews, making it easier to convert messy operational inputs into a clear deck flow with visuals, priorities, and stakeholder-friendly framing.",
        outputPreview: "The response becomes a clear slide-by-slide outline with supporting bullets and visual suggestions.",
        outputFull: [
            "Slide 1: project status snapshot with milestone timeline visual.",
            "Slide 2: wins this week with two proof points and a simple metrics chart.",
            "Slide 3: blockers and next actions with owner labels."
        ],
        likes: 29,
        viewCount: 133,
        copyCount: 17,
        shareCount: 5,
        favorites: 9,
        liked: false,
        favorited: false,
        votes: 11,
        comments: [
            {
                author: "noa",
                handle: "@noa",
                body: "This is practical for operational updates where clarity matters more than style."
            }
        ]
    }
];
