const { join } = require('path')
const morgan = require('morgan')
const fetch = require('node-fetch')
const hbs = require('express-handlebars')
const Ajv = require('ajv')
const OpenAPIValidator = require('express-openapi-validator')
const express = require('express')

const PORT = parseInt(process.env.PORT) || 3000

// Not required if using OpenAPI
const validate_post_json = (obj) => {
	const ajv = new Ajv()
	const validate = ajv.compile(obj)
	return (req, resp, next) => {
		const valid = validate(req.body)
		if (valid)
			return next()
		resp.status(400).type('text/html')
			.send(`<h2>Error</h2><ul>${validate.errors}</ul>`)
	}
}
const schema = {
	type: 'object',
	properties: {
		tz: { type: 'string' },
		time: { type: 'string' }
	},
	required: [ "tz", "time" ]
}

const policy = (config) => {
	const host = config.host || 'http://localhost'
	const port = config.port || 8181
	const prefix = config.prefix || '/v1/data'
	const package = ('/' + (config.package || '')).replaceAll('.', '/')
	return (rule) => {
		const url = `${host}:${port}${prefix}${package}${rule}`
		return (req, resp, next) => {
			const input = {
				method: req.method,
				path: req.path.substring(1).split('/'), // remove the first /
				employee: req.headers['x-employee'] || 'not set'
			}
			fetch(url, {
				method: 'POST', 
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ input })
			})
			.then(r => r.json())
			.then(r => {
				if (!!r.result)
					return next()
				resp.status(403).type('text/html')
					.render('errors', { errors: [ `Cannot ${req.method} to ${req.path}` ]})
			})
			.catch(error => {
				resp.status(500).type('text/html')
					.render('errors', { errors: [ JSON.stringify(error) ]})
			})
		}
	}
}

const can = policy({ package: 'policy.time' })

const app = express()

app.engine('hbs', hbs({ defaultLayout: false }))
app.set('view engine', 'hbs')

app.use(morgan('common'))

app.use(express.static(join(__dirname, 'static')))

app.use(
	express.json(),
	OpenAPIValidator.middleware({
		apiSpec: join(__dirname, 'time.yaml'),
	})
)

app.get('/time', 
	can('/allow_get_time'),
	(req, resp) => {
		resp.status(200).type('text/html')
			render('time', { time: (new Date()).toUTCString() })
	}
)

app.post('/time',
	can('/allow_post_time'), //validate_post_json(schema),
	(req, resp) => {
		const body = req.body
		resp.status(201).type('text/html')
			.render("update-time", { newTime: body.time, newTz: body.tz })
	}
)

app.use((err, req, resp, next) => {
	const errors = err.errors.reduce(
		(acc, v) => acc + `<code>${v.path}</code> - ${v.message}`, '')
	resp.status(400).type('text/html')
		.render('errors', { errors })
})

app.listen(PORT, () => {
	console.info(`Application started on port ${PORT} at ${new Date()}`)
})
