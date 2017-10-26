// Note: this code depends on a variable called "videos" that contains
// 		 all of the talks data in json format. It should be initialized in
//		 the Django template file.

// variables to hold the templates, since they will be removed from the DOM after initialization
var groupTemplate, videoTemplate;

// initialization code that's called when the window has finished loading
$(window).load(function () {

	// preserve the template designs so that they're not lost when updating the display
	groupTemplate = $(".group-template").clone();
	videoTemplate = $(".video-template").clone();


	// initialize the filter bar module with the talk data
	$('#fixed-side-bar').fixedSideBar();
	$('#filter-bar').filterBar({
		items: videos,
		categories: ["Year", "Project", "None"],
		groupsForCategory: {
			"Year": groupVideosByYear(),
			"Project": groupVideosByProject(),
			"None": [{"name": "Chronological List", items: videos}]
		},
		passesFilter: passesFilter,
		displayGroupHeader: formatGroup,
		displayItem: formatVideo,
	    afterDisplay: afterDisplay,
	    keywords: [] // empty list currently because videos don't currently have keyword associations
	});
	if(initialFilter && initialFilter.length > 0 && initialFilter != "None")
		$('#filter-textbox').val(initialFilter);
	$('#filter-bar').applyFilter();
});

// returns a list of videos grouped by year, sorted with the most recent year first
// TODO: this is same function as in talks.js (and possibly publications.js). Consolidate?
function groupVideosByYear()
{
	var tempGroups = {};
	videos.forEach(function(video, index, array) {
		var group = video.date.getFullYear().toString();
		if(!(group in tempGroups)) {
			tempGroups[group] = [];
		}
		tempGroups[group].push(video);
	});

	var groups = []
	for(group in tempGroups) {
		groups.push({"name": group, "items": tempGroups[group]});
	}

	// years are sorted chronologically, all of the other groupings are sorted by frequency
	groups.sort(function(a,b) { return parseInt(b.name) - parseInt(a.name) });

	return groups;
}

// returns a list of videos grouped by project, sorted with the most frequent project first
// note: a video can appear in more than one group
// TODO: this is same function as in talks.js (and possibly publications.js). Consolidate? Actually, not the same because
// videos can only belong to one and only one group currently. If this switches to many-to-one, then we have to update this
// to be more like talks.js
function groupVideosByProject()
{
	var tempGroups = {};
	videos.forEach(function(video, index, array) {
		group = video.project_short_name;
		if(!(group in tempGroups)) {
			tempGroups[group] = [];
		}
		tempGroups[group].push(video);
	});

	var groups = []
	for(group in tempGroups) {
		groups.push({"name": group, "items": tempGroups[group]});
	}

	// years are sorted chronologically, all of the other groupings are sorted by frequency
	groups.sort(function(a,b) { return b.items.length - a.items.length });

	return groups;
}

// returns true if the publication contains the text entered into the filter box anywhere
// in the title, speakers, venue, keywords, or projects
function passesFilter(video, filter) {
	filter = filter.toLowerCase();
	var passes = false;

	if(!filter || filter.length == 0) passes = true;

	if(video.title.toLowerCase().indexOf(filter) >= 0) passes = true;
	if(video.caption.toLowerCase().indexOf(filter) >= 0) passes = true;
	if(video.project_short_name.toLowerCase().indexOf(filter) >= 0) passes = true;

	return passes;
}

// adds html markup to the specified text wherever it matches the filter, applying the highlight style
// TODO: this is same function as in talks.js (and possibly publications.js). Consolidate?
function addHighlight(text, filter) {
	var result = text;
	if(filter && filter.length > 0)
		result = text.replace(new RegExp('(' + filter + ')', 'gi'), "<span class=\"highlight\">$1</span>");
	return result;
}

// helper function to populate the template with the group data
// TODO: this is same function as in talks.js (and possibly publications.js). Consolidate?
function formatGroup(group) {
	var groupData = groupTemplate.clone();
	groupData.attr("name", group.toLowerCase().replace(new RegExp(" ", "g"), "-"));
	groupData.html(group);
	return groupData[0].outerHTML;
}

function formatVideo(video, filter){
	if(filter) filter = filter.toLowerCase();

	var videoData = videoTemplate.clone();
	videoData.find(".video-title").html(addHighlight(video.title, filter));
	videoData.find(".video-caption").html(addHighlight(video.caption, filter));

	return videoData[0].outerHTML;
}

// called after initialization or whenever the filter is reapplied
function afterDisplay() {
	// Empty for now
}

//Code to use isotope for filtering from http://codepen.io/desandro/pen/wfaGu
// TODO: All of this directly copy/pasted from talks.js. Lots of redundancy here. Could be refactored
// TODO: is this code even necessary? I don't think so...

// init Isotope
var $grid = $('.video-list').isotope({
  itemSelector: '.video-template',
  layoutMode: 'fitRows',
  filter: function() {
    return qsRegex ? $(this).text().match( qsRegex ) : true;
  }
});


// use value of search field to filter
var $quicksearch = $('#filter-textbox').keyup( debounce( function() {
  qsRegex = new RegExp( $quicksearch.val(), 'gi' );
  $grid.isotope();
}, 200 ) );

// debounce so filtering doesn't happen every millisecond
function debounce( fn, threshold ) {
  var timeout;
  return function debounced() {
    if ( timeout ) {
      clearTimeout( timeout );
    }
    function delayed() {
      fn();
      timeout = null;
    }
    timeout = setTimeout( delayed, threshold || 100 );
  }
}

$(window).resize(debounce(function() {
	// hack to force the ellipsis to redraw, so that it's in the correct position
	$.each($('.line-clamp'), function(index, item) {
		$(item).hide().show(0);
	});
}));