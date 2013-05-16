(function($) {
	// Week manages the date range selection
	// On change, it updates the Days collection
	// The Days collection resets with each Day specified
	// Each day then grabs its data from the server
	// Each day on click creates new editor and requests more data

	// Model for Week
	window.Week = Backbone.Model.extend({
		previousWeek: function() {
			this.set({
				startDate: moment(this.get("startDate"), "YYYY-MM-DD").subtract('days', 7).format("YYYY-MM-DD")
			});
		},
		nextWeek: function() {
			this.set({
				startDate: moment(this.get("startDate"), "YYYY-MM-DD").add('days', 7).format("YYYY-MM-DD")
			});
		}
	});

	// Model for Day
	window.Day = Backbone.Model.extend({
		url: function() {
			return "/proxy/1/user/-/sleep/date/" + this.id + ".json";
		},

		initialize: function() {
			console.log("New Day initialized: ", this.id);
			this.fetch();
		}
	});

	// Collection for Days
	window.Days = Backbone.Collection.extend({
		model: Day,

		initialize: function(models, options) {
			// Days Collection listens for changes on Week's date
			this.week = options.week;
			this.week.on("change", this.resetDays, this);
		},

		// When Week's start date changes, reset this Collection of Day models
		resetDays: function(week) {
			console.log("Days.resetDays: Week start date changed");
			
			// Reset with the collection
			var startDate =  moment(week.get("startDate"), "YYYY-MM-DD");

			// Create new set, add 7 Day models
			var newDaySet = [];

			for (var i = 0; i < 7; i++) {
				newDaySet.push({
					id: startDate.format("YYYY-MM-DD")
				});

				// Increment Moment Date object
				startDate.add("days", 1);
			}

			this.set(newDaySet);
		}
	});

	// Model for editor
	window.Night = Backbone.Model.extend({
		url: function() {
			return "/proxy/1/user/-/activities/calories/date/" + this.id + "/"
			+ moment(this.id, "YYYY-MM-DD").add("days", 1).format("YYYY-MM-DD")
			+ "/1min.json";
		},

		initialize: function() {
			console.log("New Night initialized: ", this.id);
			this.fetch();
		}
	});


	$(document).ready(function() {
		// Views go here, as they reference templates in DOM

		window.CalendarView = Backbone.View.extend({
			el: $("#week"),

			initialize: function() {
				_.bindAll(this, "render");
				this.model = this.options.model;
			},

			render: function() {
				$("#week-start-date").text = moment(this.model.get("startDate"), "MMMM D, YYYY");
			},

			events: {
				"click #fse-calendar-prev": "requestPreviousWeek",
				"click #fse-calendar-next": "requestNextWeek"
			},

			requestPreviousWeek: function() {
				this.model.previousWeek();
			},

			requestNextWeek: function() {
				this.model.nextWeek();
			}
		});

		window.DayRowsView = Backbone.View.extend({
			el: $("#days"),

			initialize: function() {
				_.bindAll(this, "render");
				this.collection = this.options.collection;
				this.collection.on("change", this.render, this);
			},

			render: function() {
				var target = this.$el;
				target.empty();
				this.collection.each(function(day) {
					var view = new DayRowView({
						model: day
					});
					target.append(view.render().el);
				});
			}
		});

		window.DayRowView = Backbone.View.extend({
			tagName: "tr",
			template: _.template($("#day-template").html()),
			
			initialize: function(options) {
				_.bindAll(this, "render", "showHideEditor");

				this.model = this.options.model;

				this.model.on("change", this.render, this);

				this.nightView = null;
				this.nightModel = null;
			},

			events: {
				"click": "showHideEditor"
			},

			render: function() {
				console.log("Day rendering: ", this.model.get("id"));
				// Create Moment Object from id, which is just a date string
				var dateMO = moment(this.model.get("id"), "YYYY-MM-DD");

				// Format sleep duration and time awoken from Fitbit API data
				var sleepArray = this.model.get("sleep");
				var duration = "—";
				var awokenTime = "—";

				if (sleepArray && (sleepArray.length > 0)) {
					// Format duration of sleep
					// duration = (Math.round(sleepArray[0].duration/60/60/100)/10) + " hours";	// to tenths place
					duration = (Math.round(sleepArray[0].minutesAsleep/6)/10) + " hours";	// round to tenths place
					
					// Format time when awoken
					awokenTime = moment(sleepArray[0].minuteData[ sleepArray[0].minuteData.length - 1].dateTime, "HH:mm:ss").format("h:mm a");
				}

				// Render the row
				$(this.el).html(this.template({
					dayName: dateMO.format("dddd"),
					date: dateMO.format("MMMM D, YYYY"),
					awoke: awokenTime,
					duration: duration
				}));

				return this;
			},

			showHideEditor: function() {
				console.log('show hide editor');
				
				if (!this.nightView) {
					console.log('create nightView and nightModel');

					// Create a new Night model and view
					this.nightModel = new Night({id: this.model.id});
					this.nightView = new NightRowView({model: this.nightModel});

					// Insert night data row after this sleep data row
				 	this.$el.after(this.nightView.render().el);

				} else {
					// View exists, so toggle display of the night view
					this.nightView.$el.toggleClass("hide");
				}
			}
		});

		window.NightRowView = Backbone.View.extend({
			tagName: "tr",
			template: _.template($("#night-template").html()),
			
			initialize: function(options) {
				_.bindAll(this, "render");
			},

			render: function() {
				console.log('NightRowView.render');
				$(this.el).html(this.template());

				// NEXT: Create graph of calorie data
				return this;
			}
		});

		// TODO: router goes here
		// TODO: window.App = new SleepEditor();
		// TODO: Backbone.history.start();
		// So for now... do it global.

		window.week = new Week();
		window.calendarView = new CalendarView({model: window.week});
		window.days = new Days([],{week: window.week});
		window.dayRowsView = new DayRowsView({
			collection: days
		});

		// Default collection to this week
		console.log("Application intialized.");
		window.week.set({startDate: moment().startOf("week").format("YYYY-MM-DD")});
	});

})(jQuery);