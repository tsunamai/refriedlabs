// "How to tip in the US" — the etiquette guide for visitors. Data only, no Svelte imports.
// Plain-language "is a tip expected here, and how much?" across US tipping situations.
// Figures grounded in 2025–26 etiquette sources (AAA, Today, WalletHub, travel guides);
// ranges are guidance, not law. Re-verify periodically (norms drift).
import type { TipGuideCategory } from '$lib/types/bill';

// Why tipping is so heavy in the US — honest: it depends on the state. Ties to wage data.
export const TIP_GUIDE_INTRO =
	'Tipping in the US is bigger than almost anywhere — but how much it matters depends on the state. ' +
	'In many states, servers are paid a low “tipped” wage (as little as $2.13 an hour) and rely on tips ' +
	'to make a living. In others they already earn the full minimum wage, so your tip is genuinely extra. ' +
	'Either way it’s customary. Here’s what’s normal, situation by situation.';

export const TIP_GUIDE: TipGuideCategory[] = [
	{
		id: 'dining',
		title: 'Eating & drinking',
		situations: [
			{
				id: 'restaurant',
				title: 'Sit-down restaurant',
				expectation: 'expected',
				amount: '18–20% of the bill',
				suggestedPercent: 20,
				note: 'Tip on the pre-tax total. Parties of 6+ often have an automatic gratuity already added — check the bill before adding more.'
			},
			{
				id: 'counter',
				title: 'Coffee / counter & the tip screen',
				expectation: 'optional',
				amount: 'Round up, or 10% — or skip',
				suggestedPercent: 10,
				note: 'The tablet flipping around to ask for a tip is new and optional. For just handing you a coffee, “No Tip” is perfectly normal.'
			},
			{
				id: 'bartender',
				title: 'Bartender',
				expectation: 'expected',
				amount: '$1–2 per drink, or 18–20% of the tab',
				suggestedPercent: 20,
				note: 'A dollar or two per drink for simple pours; 20% if you run a tab.'
			},
			{
				id: 'cocktailserver',
				title: 'Cocktail server (table or poolside)',
				expectation: 'expected',
				amount: '$1–2 per drink, or 15–20%',
				suggestedPercent: 20,
				note: 'Whoever brings drinks to your table, beach chair, or poolside lounger — same as a bartender. Either a dollar or two per drink, or a percentage of the tab works.'
			},
			{
				id: 'sommelier',
				title: 'Sommelier / wine steward',
				expectation: 'optional',
				amount: 'Usually covered by your tip',
				suggestedPercent: null,
				note: 'At fine dining your overall 18–20% tip normally covers them; add a little extra for special help choosing a bottle.'
			},
			{
				id: 'delivery',
				title: 'Food delivery (DoorDash, Uber Eats)',
				expectation: 'expected',
				amount: '15–20%, at least $3–5',
				suggestedPercent: 20,
				note: 'Tip more in bad weather, long distances, or large orders. The driver often sees the tip before accepting.'
			},
			{
				id: 'buffet',
				title: 'Buffet / hotel breakfast',
				expectation: 'optional',
				amount: 'About 10%, or $1–2 per person',
				suggestedPercent: 10,
				note: 'When a server still clears plates and refills coffee — including a hotel breakfast buffet with table service.'
			},
			{
				id: 'foodtruck',
				title: 'Food truck',
				expectation: 'optional',
				amount: 'Round up, or 10%',
				suggestedPercent: 10,
				note: 'Nice but not required for counter-style service.'
			},
			{
				id: 'takeout',
				title: 'Takeout / pickup',
				expectation: 'extraOnly',
				amount: 'Not expected; round up if you like',
				suggestedPercent: null,
				note: 'The tip screen often appears here too — “No Tip” is normal for food you carry out yourself.'
			},
			{
				id: 'drivethru',
				title: 'Drive-thru',
				expectation: 'notCustomary',
				amount: 'No tip',
				suggestedPercent: null,
				note: 'No tipping at a drive-thru window, even if the screen offers it.'
			}
		]
	},
	{
		id: 'transport',
		title: 'Getting around',
		situations: [
			{
				id: 'rideshare',
				title: 'Taxi / Uber / Lyft',
				expectation: 'expected',
				amount: '10–20% (about 15%)',
				suggestedPercent: 15,
				note: 'Tip more if they help with luggage or it’s a tough drive. In the app you can tip after the ride.'
			},
			{
				id: 'skycap',
				title: 'Airport bag check (skycap)',
				expectation: 'expected',
				amount: '$2 per bag ($3 if heavy)',
				suggestedPercent: null,
				note: 'The curbside porter who checks your bags before your flight.'
			},
			{
				id: 'shuttle',
				title: 'Hotel / airport shuttle driver',
				expectation: 'optional',
				amount: '$2 per bag, or $5 a ride',
				suggestedPercent: null,
				note: 'Especially if they load your luggage or it saved you a taxi fare.'
			},
			{
				id: 'valet',
				title: 'Valet parking',
				expectation: 'expected',
				amount: '$3–7 when they bring the car back',
				suggestedPercent: null,
				note: 'Tip when your car is returned — not when you drop it off.'
			},
			{
				id: 'limo',
				title: 'Private car / limo service',
				expectation: 'expected',
				amount: '15–20% if not already in the fare',
				suggestedPercent: 20,
				note: 'Check the receipt — a gratuity is often already included for car services.'
			},
			{
				id: 'tourbus',
				title: 'Tour bus driver',
				expectation: 'optional',
				amount: '$1–2 per person',
				suggestedPercent: null,
				note: 'Hand it to the driver as you get off.'
			},
			{
				id: 'gasparking',
				title: 'Gas station / parking garage',
				expectation: 'notCustomary',
				amount: 'No tip',
				suggestedPercent: null,
				note: 'Pumping your own gas and self-park garages are the norm — no tipping.'
			},
			{
				id: 'cabstarter',
				title: 'Taxi starter / curbside cab line',
				expectation: 'optional',
				amount: '$1–2 if they hail or load — varies by city',
				suggestedPercent: null,
				note: 'The person running the taxi queue at an airport or hotel. This one is genuinely local: tip a dollar or two if they actively flag a cab or load your bags, nothing if they’re only pointing you to the next car.'
			},
			{
				id: 'trainattendant',
				title: 'Train sleeping-car attendant (Amtrak)',
				expectation: 'optional',
				amount: '$5–10 per night',
				suggestedPercent: null,
				note: 'For overnight sleeper service; nothing needed for a regular coach seat.'
			}
		]
	},
	{
		id: 'hotel',
		title: 'Hotels',
		situations: [
			{
				id: 'housekeeping',
				title: 'Housekeeping',
				expectation: 'expected',
				amount: '$5–10 per night, in cash',
				suggestedPercent: null,
				note: 'Leave it daily, not at the end — cleaners rotate, so daily cash reaches whoever actually cleaned your room. A note saying “thank you” helps them know it’s for them.'
			},
			{
				id: 'bellhop',
				title: 'Bellhop / porter',
				expectation: 'expected',
				amount: '$2 per bag ($4–5 if heavy)',
				suggestedPercent: null,
				note: 'For carrying your bags to your room.'
			},
			{
				id: 'concierge',
				title: 'Concierge',
				expectation: 'optional',
				amount: '$5–10 simple, $20+ for hard requests',
				suggestedPercent: null,
				note: 'Nothing for a quick question. Tip when they get you a hard reservation or tickets.'
			},
			{
				id: 'roomservice',
				title: 'Room service',
				expectation: 'checkFirst',
				amount: '15–20% only if not already added',
				suggestedPercent: 18,
				note: 'Hotels usually add a service charge to room service — look for it so you don’t tip twice.'
			},
			{
				id: 'doorman',
				title: 'Doorman',
				expectation: 'optional',
				amount: '$1–2 for hailing a cab',
				suggestedPercent: null,
				note: 'Nothing for simply opening the door; a dollar or two if they flag you a taxi or help with bags.'
			},
			{
				id: 'poolattendant',
				title: 'Pool / beach attendant',
				expectation: 'optional',
				amount: '$1–2 per service (towels, chairs)',
				suggestedPercent: null,
				note: 'A dollar or two each time they bring towels or set up your chairs — not one tip for the whole day.'
			}
		]
	},
	{
		id: 'personal',
		title: 'Hair, nails & spa',
		situations: [
			{
				id: 'hair',
				title: 'Barber / hairstylist',
				expectation: 'expected',
				amount: '20%',
				suggestedPercent: 20,
				note: 'Standard for a haircut, color, or blow-out.'
			},
			{
				id: 'nails',
				title: 'Nail salon',
				expectation: 'expected',
				amount: '15–20%',
				suggestedPercent: 20,
				note: 'Cash is appreciated.'
			},
			{
				id: 'massage',
				title: 'Massage / spa',
				expectation: 'expected',
				amount: '20%',
				suggestedPercent: 20,
				note: 'At a hotel or resort spa, check whether a service charge is already on the bill.'
			},
			{
				id: 'tattoo',
				title: 'Tattoo artist',
				expectation: 'expected',
				amount: '15–20% or more',
				suggestedPercent: 20,
				note: 'For larger or custom work, many tip more.'
			},
			{
				id: 'wax',
				title: 'Waxing / eyebrows',
				expectation: 'expected',
				amount: '15–20%',
				suggestedPercent: 20,
				note: 'Same as other salon services.'
			},
			{
				id: 'petgroomer',
				title: 'Pet groomer',
				expectation: 'optional',
				amount: '15–20%',
				suggestedPercent: 20,
				note: 'Appreciated, especially for a difficult pet.'
			},
			{
				id: 'makeup',
				title: 'Makeup artist',
				expectation: 'expected',
				amount: '15–20%',
				suggestedPercent: 20,
				note: 'Same as other salon services.'
			}
		]
	},
	{
		id: 'services',
		title: 'Other services',
		situations: [
			{
				id: 'tourguide',
				title: 'Tour guide',
				expectation: 'expected',
				amount: '10–20%, or $10–20 per person/day',
				suggestedPercent: 15,
				note: 'For a free walking tour, $5–10 per person is normal.'
			},
			{
				id: 'movers',
				title: 'Movers',
				expectation: 'expected',
				amount: '$20–30 (half day) / $40–60 (full day) per mover',
				suggestedPercent: null,
				note: 'A flat cash amount per person, not a percentage. More for stairs or heavy items.'
			},
			{
				id: 'grocery',
				title: 'Grocery delivery (Instacart)',
				expectation: 'expected',
				amount: '5–20%, at least $5',
				suggestedPercent: 15,
				note: 'More for big orders, lots of stairs, or bad weather.'
			},
			{
				id: 'furniture',
				title: 'Furniture / appliance delivery',
				expectation: 'optional',
				amount: '$5–20 per person',
				suggestedPercent: null,
				note: 'For heavy items, stairs, or installation.'
			},
			{
				id: 'casino',
				title: 'Casino dealer',
				expectation: 'optional',
				amount: 'A few dollars, or a small bet for them',
				suggestedPercent: null,
				note: 'Common when you’re winning; never required.'
			},
			{
				id: 'golfcaddie',
				title: 'Golf caddie',
				expectation: 'expected',
				amount: '$40–60, or about half the caddie fee',
				suggestedPercent: null,
				note: 'Handed to the caddie directly after your round.'
			},
			{
				id: 'skiinstructor',
				title: 'Ski / snowboard instructor',
				expectation: 'expected',
				amount: '10–20%, or $20–50',
				suggestedPercent: null,
				note: 'For a private or group lesson.'
			},
			{
				id: 'charterboat',
				title: 'Charter fishing / boat crew',
				expectation: 'expected',
				amount: '15–20% of the charter',
				suggestedPercent: null,
				note: 'Given to the captain or first mate to split among the crew.'
			},
			{
				id: 'handyman',
				title: 'Handyman / home repair',
				expectation: 'extraOnly',
				amount: 'No tip; a cold drink is kind',
				suggestedPercent: null,
				note: 'Tradespeople who set their own price usually aren’t tipped; $10–20 only for going well above and beyond.'
			},
			{
				id: 'coatcheck',
				title: 'Coat check',
				expectation: 'optional',
				amount: '$1–2 per coat',
				suggestedPercent: null,
				note: 'When you pick your coat back up.'
			},
			{
				id: 'restroom',
				title: 'Restroom attendant',
				expectation: 'optional',
				amount: '$1–2',
				suggestedPercent: null,
				note: 'Only if someone is there handing out towels or mints.'
			}
		]
	},
	{
		id: 'checkfirst',
		title: 'Check the bill first',
		situations: [
			{
				id: 'autograt',
				title: 'Automatic gratuity (large groups)',
				expectation: 'checkFirst',
				amount: 'Often 18–20% already added',
				suggestedPercent: null,
				note: 'Parties of about 6+ usually have a gratuity added automatically. Look for “gratuity” or “service charge” so you don’t tip twice.'
			},
			{
				id: 'servicecharge',
				title: '“Service charge” on the bill',
				expectation: 'checkFirst',
				amount: 'Tip may already be included',
				suggestedPercent: null,
				note: 'If the bill says “service charge” or “service included,” the tip is already in — extra is optional.'
			},
			{
				id: 'resortfee',
				title: 'Hotel “resort fee”',
				expectation: 'notCustomary',
				amount: 'Not a tip',
				suggestedPercent: null,
				note: 'A resort fee is a charge from the hotel, not a tip to staff. Still tip housekeeping and bellhops separately.'
			}
		]
	},
	{
		id: 'notip',
		title: 'You usually don’t tip',
		situations: [
			{
				id: 'fastfood',
				title: 'Fast food counter',
				expectation: 'notCustomary',
				amount: 'No tip',
				suggestedPercent: null,
				note: 'Ordering at a counter and getting your own food — no tip expected, even if a screen asks.'
			},
			{
				id: 'retail',
				title: 'Store / retail checkout',
				expectation: 'notCustomary',
				amount: 'No tip',
				suggestedPercent: null,
				note: 'Buying goods in a shop is not a tipping situation.'
			},
			{
				id: 'flight',
				title: 'Flight attendants',
				expectation: 'notCustomary',
				amount: 'No tip',
				suggestedPercent: null,
				note: 'Not customary, and many airlines don’t allow it.'
			},
			{
				id: 'medical',
				title: 'Doctors & nurses',
				expectation: 'notCustomary',
				amount: 'No tip',
				suggestedPercent: null,
				note: 'You never tip medical staff in the US.'
			}
		]
	}
];
