package policy.time

default allow_post_time = false
default allow_get_time = false

is_get {
	lower(input.method) == "get"
}

is_post {
	lower(input.method) == "post"
}

is_employee {
	some i
		data.employees[i].name == lower(input.employee)
}

is_manager {
	some i
		e = data.employees[i]
		e.name == lower(input.employee)
		e.level > 1
}

allow_get_time {
	is_get
	is_employee
}

allow_post_time {
	is_post
	input.path = [ "time" ]
	is_manager
}

