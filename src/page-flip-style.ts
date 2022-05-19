import type Vue from 'vue'

export default function getPageStyleDecorator<V extends Vue>() {
	function decorator(rule: string): (target: V, propertyKey: keyof V) => void
	function decorator(target: V, propertyKey: keyof V): void
	function decorator(arg1: string | V, arg2?: keyof V) {
		const rule = (arg2 == null) ? <string>arg1 : null
		const dec = (target: V, propertyKey: keyof V) => {
			decorator.Keys.push([propertyKey, rule])
		}
		return (rule == null) ? dec(<V>arg1, arg2!) : dec
	}
	decorator.Keys = [] as ([keyof V, string | null])[]
	decorator.get = function(instance: V) {
		return decorator.Keys.reduce((styles, [key, rule]) => {
			const value = instance[key]
			if (value != null)
				styles[rule ?? key.toString()] = `${value}px`
			return styles
		}, {} as { [rule: string]: string } )
	}
	return decorator
}
