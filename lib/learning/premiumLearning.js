// Premium Learning curriculum
// Education-only: no personal advice, no guarantees.
// Goal: make a beginner *actually understand* using:
// - Simple explanation (ELI12)
// - Normal explanation
// - Deep dive (still beginner-safe)
// - Worked examples with numbers
// - Practice questions with answers
// - Checklists + common mistakes
// - Flashcards for spaced repetition

export const PREMIUM_LEARNING = {
	version: 2,
	levels: [
		{
			key: 'beginner',
			label: 'Beginner',
			description: 'Build foundations that work in real life: goals → safety → risk → SIP → funds → behavior → taxes.',
			lessons: [
				{
					id: 'pl_beg_01_goals',
					tag: 'Core',
					minutes: 6,
					title: 'Goals first (not products)',
					objective: 'Turn “I want to invest” into a clear goal that can be planned: amount + date + monthly contribution.',
					coreIdea: 'You don’t invest for “returns”. You invest for a goal with a deadline.',
					whyItMatters:
						'Without a goal, you’ll keep switching products, reacting to news, and stopping when it gets uncomfortable.',
					explain: {
						simple: [
							'Imagine you’re booking a cab. If you don’t enter the destination, the driver can’t choose the route.',
							'A goal is your destination: (1) how much money, (2) by when, (3) what it is for.',
							'Once you set the destination, choosing the product becomes easier and calmer.',
						],
						normal: [
							'Write your goal as: Amount + Date + Purpose. Example: “₹10,00,000 in 5 years for a home down payment.”',
							'Then estimate monthly contribution (SIP). The earlier you start, the lower the monthly burden.',
							'Time horizon decides how much volatility you can tolerate.',
						],
						deep: [
							'The same “return” means different things for different timelines. A short timeline cannot afford a big fall near the deadline.',
							'Good planning focuses on: (a) deadline risk, (b) behavior risk (panic), (c) cost and taxes.',
							'Products are tools. Goals are the reason.',
						],
					},
					examples: [
						{
							title: 'Goal conversion example',
							scenario: 'You want ₹6,00,000 in 3 years for a car down payment.',
							steps: [
								'Step 1: Write goal clearly: ₹6L in 36 months.',
								'Step 2: Rough monthly savings target = ₹6,00,000 / 36 ≈ ₹16,700 per month (before any growth).',
								'Step 3: Because timeline is short, prioritize stability over “max returns”.',
							],
							result:
								'Now you have a plan number. You can choose a safer bucket for short-term goals instead of gambling with deadline money.',
						},
					],
					checklist: [
						'Write the goal (amount + date + purpose).',
						'Write the monthly contribution target.',
						'Decide: short-term (stability) vs long-term (can take volatility).',
					],
					commonMistakes: [
						'Choosing a product first because a friend said it’s “best”.',
						'Using equity for short deadlines and then panicking.',
						'Changing funds every time you see a headline.',
					],
					flashcards: [
						{ q: 'A good goal statement has what 3 parts?', a: 'Amount + Deadline + Purpose.' },
						{ q: 'Why do goals come before products?', a: 'Goal decides timeline → timeline decides risk → risk decides product.' },
					],
					practice: {
						prompts: [
							{
								q: 'Rewrite: “I want high returns.” into a proper goal.',
								a: 'Example: “I want ₹5,00,000 in 24 months for a course fee.” (Any amount+date+purpose works.)',
							},
							{
								q: 'If you need money in 1 year, should you optimize for maximum returns or stability?',
								a: 'Stability. A short deadline cannot handle big drawdowns right before you need the money.',
							},
						],
					},
					quiz: {
						question: 'Which is the best goal statement?',
						options: [
							'I want the best mutual fund',
							'I want ₹10L in 5 years for a home down payment',
							'I want to double money quickly',
							'I want a safe investment with high return',
						],
						answerIndex: 1,
						explanation: 'A good goal is specific (amount + timeline + purpose). It enables correct risk and allocation.',
					},
				},
				{
					id: 'pl_beg_02_emergency',
					tag: 'Safety',
					minutes: 7,
					title: 'Emergency fund: your financial airbag',
					objective: 'Understand what an emergency fund is, how big it should be, and why it prevents disaster decisions.',
					coreIdea: 'Emergency fund protects your plan when life hits.',
					whyItMatters:
						'Most investors fail not because they chose the wrong fund, but because they were forced to sell at the worst time.',
					explain: {
						simple: [
							'If your phone breaks, you don’t sell your house to fix it. You use emergency money.',
							'Emergency fund is money for “life emergencies”, not for growth.',
							'It’s boring on purpose: easy to access, low chance of falling when you need it.',
						],
						normal: [
							'Target 3–6 months of essential expenses (rent/EMI + food + bills + insurance).',
							'Keep it in a safe, accessible place (bank / liquid-like options).',
							'This prevents you from stopping SIPs or selling long-term investments during market falls.',
						],
						deep: [
							'Emergency fund is not “return optimization”. It’s risk management for timing risk.',
							'Rule of thumb: stable job + dual income → lower months; variable income + dependents → higher months.',
							'One clean system: Emergency fund (safety) + Goal SIP (growth). Don’t mix the two.',
						],
					},
					examples: [
						{
							title: 'Sizing the emergency fund',
							scenario: 'Your essential monthly expenses are ₹60,000.',
							steps: [
								'3 months = ₹1,80,000',
								'6 months = ₹3,60,000',
								'Start by building ₹50,000 → ₹1,00,000 → full target (phased build).',
							],
							result: 'Phased build is realistic and reduces the chance you quit early.',
						},
					],
					checklist: [
						'Calculate essential monthly expense number.',
						'Set target months (3–6; adjust for stability/dependents).',
						'Build in phases: starter buffer → full buffer.',
					],
					commonMistakes: [
						'Keeping emergency money in volatile assets to chase returns.',
						'Counting credit card limit as emergency fund.',
						'Not separating “emergency” from “planned expense” (vacation is not emergency).',
					],
					flashcards: [
						{ q: 'Emergency fund is for growth or protection?', a: 'Protection.' },
						{ q: 'Typical emergency fund size?', a: '3–6 months of essential expenses (rule of thumb).' },
					],
					practice: {
						prompts: [
							{
								q: 'If your essentials are ₹45,000/month, what is a 4-month emergency fund?',
								a: '₹1,80,000.',
							},
							{
								q: 'Name one reason emergency fund prevents bad investing decisions.',
								a: 'It avoids forced selling during market falls / avoids stopping SIP during dips.',
							},
						],
					},
					quiz: {
						question: 'Why do we keep emergency funds in low-risk places?',
						options: [
							'Because they give the highest returns',
							'Because emergencies need quick access and certainty',
							'Because equity is illegal',
							'Because it looks professional',
						],
						answerIndex: 1,
						explanation: 'Emergency money exists for certainty and access, not returns.',
					},
				},
				{
					id: 'pl_beg_03_risk',
					tag: 'Core',
					minutes: 5,
					title: 'Risk = drawdown (not daily noise)',
					objective: 'Learn the one risk metric that matters for behavior: drawdown.',
					content: [
						'Risk is how much your portfolio can fall before you panic and stop.',
						'Daily ups/downs are noise. Drawdown is the real test (e.g., -25%, -40%).',
						'Choose an allocation you can stick with through bad months.',
					],
					takeaways: [
						'A plan you can follow beats a perfect plan you abandon.',
						'Expect volatility; plan for drawdowns.',
						'Risk capacity (math) and risk tolerance (emotion) both matter.',
					],
					quiz: {
						question: 'What is the best definition of risk for most investors?',
						options: [
							'Daily price movement',
							'The chance of becoming rich quickly',
							'How much your portfolio can fall (drawdown) before you quit',
							'Only market crashes',
						],
						answerIndex: 2,
						explanation: 'Drawdown is what breaks consistency. Consistency is the main driver for most people.',
					},
				},
				{
					id: 'pl_beg_04_sip',
					tag: 'Core',
					minutes: 5,
					title: 'SIP: the behavior engine',
					objective: 'Understand why SIP works mainly by fixing behavior.',
					content: [
						'SIP is a system: you invest on schedule so emotions do not decide.',
						'It naturally buys more units when prices are lower and fewer when prices are higher.',
						'The biggest mistake is stopping SIP during red months.',
					],
					takeaways: [
						'SIP reduces timing mistakes.',
						'Step-up SIP is a powerful lever over years.',
						'Consistency > predictions.',
					],
					quiz: {
						question: 'What is the most common SIP mistake?',
						options: [
							'Starting too early',
							'Stopping SIP during market falls',
							'Investing monthly instead of daily',
							'Using a bank account',
						],
						answerIndex: 1,
						explanation: 'Stopping during dips locks in bad behavior. SIP is designed to continue through volatility.',
					},
				},
				{
					id: 'pl_beg_05_nav',
					tag: 'Mutual Funds',
					minutes: 4,
					title: 'NAV: stop judging funds by the number',
					objective: 'Learn what NAV is and why “low NAV” is not “cheap”.',
					content: [
						'NAV = (assets - liabilities) / units. It is just “price per unit”.',
						'A fund with NAV ₹10 is not cheaper than NAV ₹500. What matters is % return and risk.',
						'Compare funds within category and look at consistency + costs.',
					],
					takeaways: [
						'NAV is not a valuation metric.',
						'Compare % returns, drawdowns, and costs.',
						'Category + time horizon first.',
					],
					quiz: {
						question: 'Two funds both return 10% this year. NAVs are ₹10 and ₹500. Which is better?',
						options: ['₹10 NAV fund', '₹500 NAV fund', 'NAV cannot decide; returns and risk decide', 'Both are illegal'],
						answerIndex: 2,
						explanation: 'NAV level alone is meaningless. Compare returns, risk, and costs.',
					},
				},
				{
					id: 'pl_beg_06_costs',
					tag: 'Costs',
					minutes: 5,
					title: 'Fees quietly eat wealth',
					objective: 'Understand expense ratio and why small % matters long-term.',
					content: [
						'Fees are a guaranteed drag. Markets are uncertain, fees are certain.',
						'A 1% higher fee can reduce long-term outcome materially.',
						'Use low-cost funds where possible, especially for core exposures.',
					],
					takeaways: [
						'Fees compound negatively.',
						'Index funds often win after costs for core exposure.',
						'Pay higher fees only with a strong reason.',
					],
					quiz: {
						question: 'Why do small fees matter?',
						options: ['They do not matter at all', 'They reduce returns every single year', 'They only matter for rich people', 'They increase volatility'],
						answerIndex: 1,
						explanation: 'A fee is a persistent reduction in annual return, compounding over time.',
					},
				},
				{
					id: 'pl_beg_07_asset_mix',
					tag: 'Strategy',
					minutes: 6,
					title: 'Asset allocation beats fund picking',
					objective: 'Why the mix (equity/debt/gold) often matters more than “best fund”.',
					content: [
						'Asset allocation is the percentage split across asset classes.',
						'It controls both return potential and drawdown.',
						'A simple, consistent mix often beats complex, frequently-changed portfolios.',
					],
					takeaways: [
						'Mix decides the experience (volatility) and outcome.',
						'Rebalance occasionally to keep risk consistent.',
						'Simplicity improves discipline.',
					],
					quiz: {
						question: 'What usually matters more for long-term outcomes?',
						options: ['Picking the hottest fund', 'Asset allocation (your mix)', 'Daily news', 'One-time timing'],
						answerIndex: 1,
						explanation: 'Your mix drives volatility and return profile; fund selection is secondary.',
					},
				},
				{
					id: 'pl_beg_08_tax_basics',
					tag: 'Tax',
					minutes: 5,
					title: 'Tax: the return you actually keep',
					objective: 'Understand post-tax vs pre-tax returns and why it changes choices.',
					content: [
						'Two investments with same pre-tax return can have different post-tax outcomes.',
						'Always compare “what you keep” after taxes and inflation.',
						'Tax rules change; focus on principles and keep documentation.',
					],
					takeaways: [
						'Compare post-tax returns.',
						'Inflation-adjusted thinking prevents illusions.',
						'Use tax benefits only when they match your goal and horizon.',
					],
					quiz: {
						question: 'Why should you care about post-tax returns?',
						options: ['Taxes are optional', 'Because post-tax is the money you keep', 'Because markets do not move', 'Because NAV is fixed'],
						answerIndex: 1,
						explanation: 'Your real outcome is what remains after tax and inflation.',
					},
				},
				{
					id: 'pl_beg_09_behavior',
					tag: 'Behavior',
					minutes: 4,
					title: 'The two emotions that break portfolios',
					objective: 'Learn the behavior traps: panic selling and FOMO buying.',
					content: [
						'Panic selling happens after falls; FOMO buying happens after rises.',
						'A written plan + SIP + rebalancing reduces emotion-driven decisions.',
						'The goal is boring consistency.',
					],
					takeaways: [
						'Plan + automation beats willpower.',
						'Avoid reacting to daily headlines.',
						'Review periodically, not constantly.',
					],
					quiz: {
						question: 'Which pair best describes common investor mistakes?',
						options: ['Patience and discipline', 'Panic selling and FOMO buying', 'Math and logic', 'Diversification and rebalancing'],
						answerIndex: 1,
						explanation: 'These two emotions create buy-high/sell-low behavior.',
					},
				},
				{
					id: 'pl_beg_10_next_steps',
					tag: 'Core',
					minutes: 6,
					title: 'Your simple system (the 4-bucket method)',
					objective: 'Combine everything into a simple, repeatable system you can run monthly.',
					content: [
						'Bucket 1: Emergency fund (safety buffer).',
						'Bucket 2: Short-term goals (0–3 years): prioritize stability.',
						'Bucket 3: Long-term goals (3+ years): systematic investing (SIP).',
						'Bucket 4: Protection (insurance) + documentation (tax proofs).',
						'Operate it monthly: automate contributions → avoid tinkering → review annually or when life changes.',
					],
					takeaways: [
						'Systems beat motivation.',
						'Keep money for different purposes in different buckets.',
						'Annual review is enough for most people.',
					],
					quiz: {
						question: 'Which routine is healthiest for most long-term investors?',
						options: ['Check portfolio every hour', 'Change funds weekly', 'Automate monthly + review annually', 'Never look at anything'],
						answerIndex: 2,
						explanation: 'Automation reduces emotion; periodic reviews keep it practical without overreacting.',
					},
				},
			],
		},
	],
};

export function getPremiumLearningLevel(levelKey = 'beginner') {
	const level = PREMIUM_LEARNING.levels.find((l) => l.key === levelKey);
	return level || PREMIUM_LEARNING.levels[0];
}

export function getDailyPremiumLessonId(date = new Date(), levelKey = 'beginner') {
	const level = getPremiumLearningLevel(levelKey);
	const lessons = Array.isArray(level?.lessons) ? level.lessons : [];
	if (!lessons.length) return null;

	// Deterministic daily pick: day-of-year -> index
	const start = new Date(date.getFullYear(), 0, 0);
	const diff = date - start;
	const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
	const idx = ((dayOfYear % lessons.length) + lessons.length) % lessons.length;
	return lessons[idx].id;
}

