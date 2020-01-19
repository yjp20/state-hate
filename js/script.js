const $ = function(x) {
	return [...document.querySelectorAll(x)]
}

const $s = function(x) {
	return document.querySelector(x)
}

const DATA = {
	"WA": "CA",
	"OR": "CA",
	"CA": "TX",
	"MT": "CA",
	"ID": "CA",
	"NV": "CA",
	"UT": "CA",
	"AZ": "CA",
	"WY": "CA",
	"CO": "CA",
	"NM": "TX",
	"AK": "TX",
	"OK": "TX",
	"KS": "MO",
	"MO": "KS",
	"TX": "OK",
	"ND": "SD",
	"SD": "ND",
	"NE": "IA",
	"IA": "NE",
	"MN": "WI",
	"WI": "IL",
	"MI": "OH",
	"OH": "MI",
	"AR": "AL",
	"LA": "AL",
	"MS": "AL",
	"KY": "TN",
	"TN": "KY",
	"IN": "KY",
	"AL": "FL",
	"FL": "FL",
	"GA": "FL",
	"SC": "OH",
	"VA": "WV",
	"WV": "VA",
	"NC": "SC",
	"NY": "NJ",
	"PA": "NJ",
	"MD": "VA",
	"DE": "NJ",
	"CT": "NJ",
	"RI": "MA",
	"MA": "NY",
	"VT": "MA",
	"NH": "MA",
	"ME": "MA",
}

const DESC = {
	"CA": "California is the most hated place in the US. Probably because it's objectively the best place to live.",
	"NJ": "It's New Jersey. They hate everyone, and, honestly, everybody hates them.",
	"FL": "Florida hates themselves the most, the only state to do so."
}

var $main
var $states
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

function init() {
	$main = SVG("#main")
	$main_columns = $("#main-columns")[0]
	$content_state = $("#content-state")[0]
	$content_desc = $("#content-desc")[0]
	$content_hates = $("#content-hates")[0]
	$content_hated = $("#content-hated-by")[0]
	$states = [...$(".state > path")]
	centers = getStateCenters()

	copy = {}
	Object.assign(copy, DATA)

	// Draw lines connecting states

	for (var state in copy) {
		bbox_from = centers[state]
		bbox_to = centers[DATA[state]]

		curve_data = getCurve(bbox_from.cx, bbox_from.cy, bbox_to.cx, bbox_to.cy)

		var curve = $main.path(curve_data)
		curve.addClass('connect')
		curve.fill('none')
		curve.data('from', state)
		curve.data('to', DATA[state])

		if (DATA[state] == state) {
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

		else if (DATA[DATA[state]] == state) {
			curve.addClass('bi')
			curve.stroke({width: 6})
		}

		else {
			curve.addClass('one')
			curve.stroke({width: 4})
		}
	}

	// Draw circles in the middle of states

	for (var state in centers) {
		bbox = centers[state]
		$main.circle(10).move(bbox.cx-5, bbox.cy-5).fill('black')
	}

	for (var state in $states) {
		$states[state].addEventListener("click", function (e){
			// Clear all selections
			$('[data-selected="true"').forEach((e) => {
				e.dataset.selected = "false"
			})

			$main_columns.dataset.expanded = "true"
			this.dataset.selected = "true"

			$content_state.innerText = this.id
			$content_desc.innerText = this.id in DESC ? DESC[this.id] : ""
			$content_hates.innerText = DATA[this.id]
			$content_hated.innerHTML = ""

			var hated_by = Object.keys(DATA).filter(e => DATA[e] == this.id)
			hated_by.forEach((e) => {
				var $li = document.createElement("li")
				$li.innerText = e
				$content_hated.appendChild($li)
			})

			$related_lines = [...$('[data-to="' + this.id + '"]'), ...$('[data-from="' + this.id + '"]')]
			$related_lines.forEach((e) => {
				e.dataset.selected = "true"
			})
		}.bind($states[state]))
	}
}

init()
