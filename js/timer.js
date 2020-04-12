// Update the count down every 1 second
var x = setInterval(function() {
	$.get("http://api.gaiarocketprogram.fr/launch-status", function(data) {
		// If data is undefined that's mean there's no launch scheduled
		if (data === undefined) {
			clearInterval(x);
			$("#status").html("Aucun lancement de prévu.");
			$("#timer").hide();
			return;
		}

		var countDownDate = new Date(data.launchDate);

		updateTimerValue(countDownDate);

		// If the launch status is set to CANCELLED
		// We stop the refreshing method
		if(data.status == "CANCELLED") {
			clearInterval(x);
		}

		// Finally update the rest of the page
		$("#welcome_text").html(data.name);

		// Update objective list
		$("#steps table").html("<tr><th>Nom</th><th>Tps</th></tr>");
		data.steps.forEach(function(step) {
			var row = $("<tr>");
			var stepName = $("<td>").text(step.name).addClass(getStepStyle(step.id, data.currentStep));
			var stepTime = $("<td>").text(step.id > data.lastStep ? getStepExecDate(step, countDownDate) : "T - 00:00:00").addClass(getStepStyle(step.id, data.lastStep, data.activeStep));
			$("#steps table").append(row.append(stepName).append(stepTime));
		});

		// Finally if there's a status message, update the page with it
		// else set empty message (useful to clear existing message)
		$("#status").html(data.statusMessage !== undefined ? data.statusMessage : "");
	});
}, 1000);

// Update the timer value
function updateTimerValue(launchTime) {
	// Get today datetime
	var now = new Date().getTime();

	// Find the distance between now an the count down date
	var distance = launchTime - now;

	// If the count down is finished, write some text
	if (distance < 0) {
		clearInterval(x);
		$("#status").html("LAUNCHED !!");
		$("#timer").hide();
		return;
	}

	let {days, hours, minutes, seconds} = computeTimeBetweenDate(launchTime, now);

	// Display the result in the element with id="demo"
	$("#days_value").html(days);
	$("#hours_value").html(hours);
	$("#minutes_value").html(minutes);
	$("#seconds_value").html(seconds);
}

/// Compute the time between two date and return the
/// Result as object of days, hours, minutes, seconds
function computeTimeBetweenDate(date1, date2) {

	// Find the distance between now an the count down date
	var distance = date1 - date2;

	// Time calculations for days, hours, minutes and seconds
	var days = Math.floor(distance / (1000 * 60 * 60 * 24));
	var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	var seconds = Math.floor((distance % (1000 * 60)) / 1000);

	return {days, hours, minutes, seconds};
}

function getStepExecDate(step, launchDate) {
	var stepExecDate = new Date();
	stepExecDate.setTime(launchDate.getTime() - (step.executionTime*1000));

	let {days, hours, minutes, seconds} = computeTimeBetweenDate(stepExecDate, new Date());

	return "T - " + days + ":" + hours + ":" + minutes + ":" + seconds;
}

function getStepStyle(stepId, lastStep, activeStep) {
	if (stepId <= lastStep) return "finished";
	if (activeStep !== undefined && stepId == activeStep) return "inprogress";
	if (stepId > lastStep) return "todo";
}
