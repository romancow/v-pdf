import type { PropType } from 'vue'
import { type Vue, Prop } from 'vue-property-decorator'
import type { FlipSetting } from 'page-flip'

type PropDecorator = ReturnType<typeof Prop>
type ConvertValue<V, S extends keyof FlipSetting> = (val: V) => (FlipSetting[S] | undefined)
type SettingFactory<T extends Vue> = <K extends keyof T & string, S extends keyof FlipSetting>(setting?: S, convert?: ConvertValue<T[K], S>) => PropDecorator
type SettingDecorator<T extends Vue>  = PropDecorator & SettingFactory<T>

function PageFlipSetting<T extends Vue>(type: PropType<any>) {
	const prop = Prop({ type, default: null })
	return function(...args: [...Parameters<SettingDecorator<T>>]) {
		const isFactory = (args[0] == null) || (args[1] == null) || (args[1] instanceof Function)
		if (!isFactory)
			return prop(...<unknown>args as Parameters<PropDecorator>)
		else return function(target: T, propertyKey: string) {
			PageFlipSetting.Props.push([propertyKey, args[0], args[1]])
			prop(target, propertyKey)
		}
	} as SettingDecorator<T>
}
PageFlipSetting.Boolean = PageFlipSetting(Boolean)
PageFlipSetting.Number = PageFlipSetting(Number)
PageFlipSetting.Inverse = <S extends keyof FlipSetting>(setting: S) => {
	return PageFlipSetting.Boolean(setting, val => (val == null) ? val : !val)
}
PageFlipSetting.Props = [] as [string, keyof FlipSetting | undefined, ((val: any) => any) | undefined][]
PageFlipSetting.get = function<T extends Vue>(component: T) {
	const settings: { [k:string]: any} = {}
	PageFlipSetting.Props.forEach(([prop, setting, convert]) => {
		const value = component[<keyof T>prop]
		const converted = convert ? convert(value) : value
		if (converted != null)
			settings[setting ?? prop] = converted
	})
	return settings as Partial<FlipSetting>
}

export default PageFlipSetting
