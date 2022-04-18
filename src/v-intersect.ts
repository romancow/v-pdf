import type { DirectiveFunction } from 'vue'

const VIntersect: DirectiveFunction = function(el, { value, oldValue }) {
	if (oldValue)
		(<IntersectionObserver>oldValue).unobserve(el)
	if (value)
		(<IntersectionObserver>value).observe(el)
}

export default VIntersect
