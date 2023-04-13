interface calEvent {
	title: string;
	description: string;
	location: string;
	start: Date;
	end: Date;
}

export function generateIcsContent(events: calEvent[]): string {
	return getIcsContent();
	function getIcsContent() {
		let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Rodeo//NONSGML//EN\n';
		for (const event of events) {
			icsContent += 'BEGIN:VEVENT\n';
			icsContent += `SUMMARY:${event.title}\n`;
			icsContent += `DTSTART:${event.start
				.toISOString()
				.replace(/[-:]/g, '')
				.replace(/\.\d\d\d/g, '')}\n`;
			icsContent += `DTEND:${event.end
				.toISOString()
				.replace(/[-:]/g, '')
				.replace(/\.\d\d\d/g, '')}\n`;
			icsContent += `DESCRIPTION:${event.description}\n`;
			icsContent += `LOCATION:${event.location}\n`;
			icsContent += 'END:VEVENT\n';
		}
		icsContent += 'END:VCALENDAR\n';
		const blob = new Blob([icsContent], { type: 'text/calendar' });
		const url = URL.createObjectURL(blob);
		return url;
	}
}
