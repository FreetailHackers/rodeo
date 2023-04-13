interface calEvent {
	title: string;
	description: string;
	location: string;
	start: [number, number, number, number, number];
	end: [number, number, number, number, number];
}

export function generateIcsContent(events: calEvent[]): string {
	let url: string;
	return (url = getIcsContent());
	function getIcsContent() {
		let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Rodeo//NONSGML//EN\n';
		for (const event of events) {
			icsContent += 'BEGIN:VEVENT\n';
			icsContent += `SUMMARY:${event.title}\n`;
			icsContent += `DTSTART:${new Date(
				event.start[0],
				event.start[1] - 1,
				event.start[2],
				event.start[3],
				event.start[4]
			)
				.toISOString()
				.replace(/[-:]/g, '')
				.replace(/\.\d\d\d/g, '')}\n`;
			icsContent += `DTEND:${new Date(
				event.end[0],
				event.end[1] - 1,
				event.end[2],
				event.end[3],
				event.end[4]
			)
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
