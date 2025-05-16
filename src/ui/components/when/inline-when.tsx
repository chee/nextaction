import "./inline-when.css"
import type {Doable} from "::domain/mixins/withDoable.ts"
import {Show} from "solid-js"
import * as dates from "date-fns"
import {icons} from "../../styles/themes/themes.ts"

export default function InlineWhen(props: {when: Doable["when"]}) {
	const when = () => props.when as Date

	return (
		<span class="inline-when">
			<Show when={when() && when() instanceof Date}>
				<Show
					when={dates.isToday(when())}
					fallback={<span class="inline-when__label">{short(when())}</span>}>
					{icons.today}
				</Show>
			</Show>
		</span>
	)
}

function short(date: Date) {
	if (dates.isThisWeek(date)) {
		return date.toLocaleString("default", {weekday: "short"})
	}

	if (dates.isThisYear(date)) {
		return date.toLocaleString("default", {
			day: "numeric",
			month: "short",
		})
	}

	return date.toLocaleString("default", {
		month: "short",
		year: "numeric",
	})
}
