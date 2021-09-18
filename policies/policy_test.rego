package policy.time

# data
post_betty = { "method": "POST", "path": [ "time" ], "employee": "betty" }
post_fred = { "method": "POST", "path": [ "time" ], "employee": "fred" }
get_fred = { "method": "GET", "path": [ "time" ], "employee": "fred" }
get_anon = { "method": "GET", "path": [ "time" ], "employee": "anon" }

test_post_time_allowed {
	allow_post_time with input as post_betty
}

test_post_time_not_allowed {
	not allow_post_time with input as post_fred
}

test_get_time_allowed {
	allow_get_time with input as get_fred
}

test_get_time_not_allowed {
	not allow_get_time with input as get_anon
}
