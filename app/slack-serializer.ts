
// Import the application services.
import { Incident } from "./incident.service";
import { Timezone } from "./timezones";

export class SlackSerializer {

	// I serialize the given incident for use in a Slack message.
	public serialize(
		incident: Incident,
		updateLimit: number,
		format: string,
		timezone: Timezone
		) : string {

		var parts = [
			`*Incident Description*: ${ incident.description }`,
			`*Priority*: ${ incident.priority.id }`,
			`*Start of Customer Impact*: ${ this.formatTime( incident.startedAt, timezone ) }`,
			`*Zoom or Hangout link*: \`${ incident.videoLink }\` `,
			`*Status*: ${ incident.status.id }`,
			`*Timeline*: \`https://bennadel.github.io/Incident-Commander/#${ incident.id }\` `
		];

		var visibleUpdates = incident.updates.slice( -updateLimit );

		// If there are updates to show, add a spacer between the heads-up data and the
		// actual timeline items.
		if ( visibleUpdates.length ) {

			parts.push( "" );

		}

		// If not all updates are visible, add an indication as to how many are hidden.
		if ( visibleUpdates.length !== incident.updates.length ) {

			var hiddenCount = ( incident.updates.length - visibleUpdates.length );

			parts.push( `> _.... *${ hiddenCount } update(s)* not being shown._` );
			parts.push( "> " );

		}

		// Render visible updates.
		for ( var i = 0 ; i < visibleUpdates.length ; i++ ) {

			// Only add a line-delimiter if the format is readable.
			if ( ( format === "readable" ) && ( i !== 0 ) ) {

				parts.push( "> " );

			}

			var update = visibleUpdates[ i ];

			parts.push( `> *${ this.formatTime( update.createdAt, timezone ) } [ ${ update.status.id } ]*: \u2014 ${ update.description }` );

		}

		return( parts.join( "\n" ) );


	}


	// ---
	// PRIVATE METHODS.
	// ---


	// I format the given Date object as a time string in the EST / EDT timezone.
	private formatTime( value: Date, timezone: Timezone ) : string {

		// In order to [try our best to] convert from the local timezone to the Slack
		// timezone for rendering, we're going to use the difference in offset minutes
		// to alter a local copy of the Date object.
		var offsetDelta = ( timezone.offset - value.getTimezoneOffset() );

		// Clone the date so we don't mess up the original value as we adjust it.
		var slackDate = new Date( value );

		// Attempt to move from the current TZ to the given TZ by adjusting minutes.
		slackDate.setMinutes( slackDate.getMinutes() - offsetDelta );

		var hours = slackDate.getHours();
		var minutes = slackDate.getMinutes();
		var period = ( hours < 12 )
			? "AM"
			: "PM"
		;

		var normalizedHours = ( ( hours % 12 ) || 12 );
		var normalizedMinutes = ( "0" + minutes ).slice( -2 );

		return( `${ normalizedHours }:${ normalizedMinutes } ${ period } ${ timezone.abbreviation }` );

	}

}
