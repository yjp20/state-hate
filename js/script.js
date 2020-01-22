const $ = function(x) {
	return [...document.querySelectorAll(x)]
}

const $s = function(x) {
	return document.querySelector(x)
}

const ABBREV_MAP = {
	"AL": "Alabama",
	"AK": "Alaska",
	"AS": "American Samoa",
	"AZ": "Arizona",
	"AR": "Arkansas",
	"CA": "California",
	"CO": "Colorado",
	"CT": "Connecticut",
	"DE": "Delaware",
	"DC": "District Of Columbia",
	"FM": "Federated States Of Micronesia",
	"FL": "Florida",
	"GA": "Georgia",
	"GU": "Guam",
	"HI": "Hawaii",
	"ID": "Idaho",
	"IL": "Illinois",
	"IN": "Indiana",
	"IA": "Iowa",
	"KS": "Kansas",
	"KY": "Kentucky",
	"LA": "Louisiana",
	"ME": "Maine",
	"MH": "Marshall Islands",
	"MD": "Maryland",
	"MA": "Massachusetts",
	"MI": "Michigan",
	"MN": "Minnesota",
	"MS": "Mississippi",
	"MO": "Missouri",
	"MT": "Montana",
	"NE": "Nebraska",
	"NV": "Nevada",
	"NH": "New Hampshire",
	"NJ": "New Jersey",
	"NM": "New Mexico",
	"NY": "New York",
	"NC": "North Carolina",
	"ND": "North Dakota",
	"MP": "Northern Mariana Islands",
	"OH": "Ohio",
	"OK": "Oklahoma",
	"OR": "Oregon",
	"PW": "Palau",
	"PA": "Pennsylvania",
	"PR": "Puerto Rico",
	"RI": "Rhode Island",
	"SC": "South Carolina",
	"SD": "South Dakota",
	"TN": "Tennessee",
	"TX": "Texas",
	"UT": "Utah",
	"VT": "Vermont",
	"VI": "Virgin Islands",
	"VA": "Virginia",
	"WA": "Washington",
	"WV": "West Virginia",
	"WI": "Wisconsin",
	"WY": "Wyoming"
}

const HATES = {
	"AK": "TX",
	"AL": "FL",
	"AR": "AL",
	"AZ": "CA",
	"CA": "TX",
	"CO": "CA",
	"CT": "NJ",
	"DE": "NJ",
	"FL": "FL",
	"GA": "FL",
	"IA": "NE",
	"ID": "CA",
	"IL": "IN",
	"IN": "KY",
	"KS": "MO",
	"KY": "TN",
	"LA": "AL",
	"MA": "NY",
	"MD": "VA",
	"ME": "MA",
	"MI": "OH",
	"MN": "WI",
	"MO": "KS",
	"MS": "AL",
	"MT": "CA",
	"NC": "SC",
	"ND": "SD",
	"NE": "IA",
	"NH": "MA",
	"NM": "TX",
	"NV": "CA",
	"NY": "NJ",
	"OH": "MI",
	"OK": "TX",
	"OR": "CA",
	"PA": "NJ",
	"RI": "MA",
	"SC": "OH",
	"SD": "ND",
	"TN": "KY",
	"TX": "OK",
	"UT": "CA",
	"VA": "WV",
	"VT": "MA",
	"WA": "CA",
	"WI": "IL",
	"WV": "VA",
	"WY": "CA",
	"NJ": "ALL",
}

const DESC = {
	"CA": "California is the most hated place in the US. Probably because it's objectively the best place to live.",
	"NJ": "It's New Jersey. They hate everyone, and, honestly, everybody hates them.",
	"AL": "Roll tide.",
	"FL": "Florida hates themselves the most, the only state to do so."
}

var	$main
var	$main_columns
var	$content_state
var	$content_desc
var	$content_hates
var	$content_hated
var	$states
var centers

function getStateCenters() {
	var returner = {}
	$states.forEach(elem => {
		var bbox = SVG.adopt(elem).bbox()
		returner[elem.id] = bbox
	})
	return returner
}

function getCurve(a, b, c, d) {
	var mid_x = (a+c)/2
	var mid_y = (b+d)/2
	var theta = Math.atan2(d-b,c-a) - Math.PI / 2
	var offset = 0
	//Math.sqrt((a-c)*(a-c) + (b-d)*(b-d)) / 8
	var cx = mid_x + offset*Math.cos(theta)
	var cy = mid_y + offset*Math.sin(theta)
	return [
		['M', a, b],
		['Q', cx, cy],
		[c, d],
	]
}

function deselect() {
	$s("#main-columns").dataset.expanded = "false"
	partialDeselect()
}

function partialDeselect() {
	$('[data-selected="true"').forEach((e) => {
		e.dataset.selected = "false"
	})
}

function selectMult(states, title, desc, $related_lines) {
	partialDeselect()

	$main_columns.dataset.expanded = "true"

	find_lines = $related_lines === undefined

	if (find_lines) $related_lines = []

	states.forEach((e) => {
		$state = $s('#'+e)
		$state.dataset.selected = "true"
		if (find_lines) $related_lines.push(...$('[data-to="' + e + '"]'), ...$('[data-from="' + e + '"]'))
	})

	$related_lines.forEach((e) => {
		e.dataset.selected = "true"
	})

	$content_state.innerText = title
	$content_desc.innerText = desc
	$content_hates.innerText = "N/A"
	$content_hated.innerHTML = "<li>N/A</li>"
}

function selectOne(state) {
	partialDeselect()

	$state = $s("#" + state)

	$main_columns.dataset.expanded = "true"
	$state.dataset.selected = "true"

	$content_state.innerText = ABBREV_MAP[state]
	$content_desc.innerText = DESC[state] || ""
	$content_hates.innerText = ABBREV_MAP[HATES[state]] || ( HATES[state] == "ALL" ? "Everyone" : "No one")
	$content_hated.innerHTML = ""

	var hated_by = Object.keys(HATES).filter(e => HATES[e] == state)

	hated_by.forEach((e) => {
		var $li = document.createElement("li")
		$li.innerText = ABBREV_MAP[e]
		$content_hated.appendChild($li)
	})

	$related_lines = [...$('[data-to="' + state + '"]'), ...$('[data-from="' + state + '"]')]
	$related_lines.forEach((e) => {
		e.dataset.selected = "true"
	})
}

function selectRivals() {
	rivals = Object.keys(HATES).filter(e => e === HATES[HATES[e]])
	$related_lines = [...$("path.connect.bi")]
	selectMult(rivals, "Rivals", "These states hate each other. (Technically, Flordia's rival is the great Florida)", $related_lines)
}

function init() {
	$main = SVG("#main")
	$main_columns = $s("#main-columns")
	$content_state = $s("#content-state")
	$content_desc = $s("#content-desc")
	$content_hates = $s("#content-hates")
	$content_hated = $s("#content-hated-by")
	$states = [...$(".state > path")]
	centers = getStateCenters()

	// Draw lines connecting states

	for (var state in HATES) {
		bbox_from = centers[state]

		if (HATES[state] == "ALL") {
			for (var other in HATES) {
				if (other === state) continue

				bbox_to = centers[other]
				curve_data = getCurve(bbox_from.cx, bbox_from.cy, bbox_to.cx, bbox_to.cy)

				var curve = $main.path(curve_data)
				curve.addClass('connect')
				curve.fill('none')
				curve.data('from', state)
				curve.data('to', other)
				curve.addClass("hidden")
				curve.addClass("one")
				curve.stroke({width: 4})
			}
		}

		else {
			bbox_to = centers[HATES[state]]
			curve_data = getCurve(bbox_from.cx, bbox_from.cy, bbox_to.cx, bbox_to.cy)

			var curve = $main.path(curve_data)
			curve.addClass('connect')
			curve.fill('none')
			curve.data('from', state)
			curve.data('to', HATES[state])

			if (HATES[state] == state) {
				r = 20
				curve.plot([
					['M', bbox_from.cx, bbox_from.cy],
					['m', -r * (1-1/Math.sqrt(2)), r * (1/Math.sqrt(2))],
					['a', r, r, 0, 1, 0, r*2, 0],
					['a', r, r, 0, 1, 0, -r*2, 0],
				])
				curve.addClass('one')
				curve.stroke({width: 4})
			}

			else if (HATES[HATES[state]] == state) {
				curve.addClass('bi')
				curve.stroke({width: 6})
			}

			else {
				curve.addClass('one')
				curve.stroke({width: 4})
			}
		}
	}


	// Draw circles in the middle of states

	for (var state in centers) {
		bbox = centers[state]
		$main.circle(10).move(bbox.cx-5, bbox.cy-5).fill('black')
	}


	// Add click listeners to states

	for (var state in $states) {
		$states[state].addEventListener("click", function (e){
			selectOne(this)
		}.bind($states[state].id))
	}
}

init()
